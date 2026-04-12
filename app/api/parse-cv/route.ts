// app/api/parse-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert en extraction de données depuis des CV. Tu réponds UNIQUEMENT avec du JSON valide, sans backticks, sans commentaires, sans texte avant ou après.`;

function buildUserPrompt(cvText: string): string {
  return `Extrais les informations de ce CV et retourne UNIQUEMENT ce JSON (remplace les valeurs vides par "" ou []) :

{
  "fullName": "",
  "title": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "github": "",
  "linkedin": "",
  "portfolio": "",
  "socialLinks": [],
  "experiences": [{"company":"","position":"","dates":"","description":""}],
  "skills": [],
  "education": [{"school":"","degree":"","dates":""}],
  "projects": [{"name":"","description":"","technologies":"","dates":"","url":""}],
  "languages": [{"language":"","level":""}],
  "certifications": [{"name":"","issuer":"","date":""}],
  "interests": []
}

CV :
${cvText}`;
}

// ─── Extraction JSON robuste ──────────────────────────────────────────────────

function extractJson(text: string): any {
  let clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try { return JSON.parse(clean); } catch {}

  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(clean.slice(start, end + 1)); } catch {}
  }

  if (start !== -1) {
    let partial = clean.slice(start);
    let braces = 0, brackets = 0, inString = false, escape = false;
    for (const ch of partial) {
      if (escape)                  { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"')              { inString = !inString; continue; }
      if (inString)                continue;
      if (ch === '{')  braces++;
      if (ch === '}')  braces--;
      if (ch === '[')  brackets++;
      if (ch === ']')  brackets--;
    }
    const lastComma = partial.lastIndexOf(',');
    const lastClose = Math.max(partial.lastIndexOf('}'), partial.lastIndexOf(']'));
    if (lastComma > lastClose) partial = partial.slice(0, lastComma);
    const closing = ']'.repeat(Math.max(0, brackets)) + '}'.repeat(Math.max(0, braces));
    try { return JSON.parse(partial + closing); } catch {}
  }

  throw new Error('JSON invalide dans la réponse du modèle');
}

// ─── Extraction texte PDF ─────────────────────────────────────────────────────

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const decoder = new TextDecoder('latin1');
  const raw = decoder.decode(buffer);
  const texts: string[] = [];

  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    const strRegex = /\(([^)]{1,300})\)/g;
    let strMatch;
    while ((strMatch = strRegex.exec(block)) !== null) {
      const decoded = strMatch[1]
        .replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\')
        .trim();
      if (decoded.length > 1 && /[a-zA-ZÀ-ÿ0-9@.]/.test(decoded)) texts.push(decoded);
    }
  }

  const hexRegex = /<([0-9A-Fa-f]{4,})>/g;
  while ((match = hexRegex.exec(raw)) !== null) {
    const hex = match[1];
    let str = '';
    for (let i = 0; i < hex.length - 1; i += 4) {
      const code = parseInt(hex.slice(i, i + 4), 16);
      if (code > 31 && code < 65535) str += String.fromCharCode(code);
    }
    if (str.length > 2 && /[a-zA-ZÀ-ÿ]/.test(str)) texts.push(str.trim());
  }

  const result = texts.join(' ').replace(/\s+/g, ' ').trim();
  return result.length > 50 ? result : '';
}

// ─── Appels IA ────────────────────────────────────────────────────────────────

async function parseWithGemini(cvText: string, model: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_KEY_MISSING');

  const inputText = cvText.slice(0, 10000);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(inputText) }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4000 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erreur Gemini');
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Réponse vide de Gemini');
  return extractJson(text);
}

async function parseWithGroq(cvText: string, model: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_KEY_MISSING');

  const inputText = cvText.slice(0, 3500);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 8000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(inputText) },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    const errMsg = err.error?.message || 'Erreur Groq';
    // Tagger les erreurs récupérables pour que le fallback Gemini les attrape
    if (res.status === 429 || errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('quota')) {
      throw new Error('GROQ_QUOTA: ' + errMsg);
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const finishReason = data.choices?.[0]?.finish_reason;
  const text = data.choices?.[0]?.message?.content ?? '';

  if (!text) throw new Error('GROQ_EMPTY');

  if (finishReason === 'length') {
    console.warn('[parse-cv] Groq tronqué, tentative de récupération...');
    try { return extractJson(text); } catch {
      throw new Error('GROQ_TRUNCATED');
    }
  }

  return extractJson(text);
}

// ─── Route POST ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let provider = 'gemini';
  try {
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;
    provider       = (formData.get('provider') as string) || 'gemini';
    const model    = (formData.get('model') as string)    || 'gemini-2.0-flash';

    if (!file) return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop lourd (max 5 Mo)' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    let cvText = '';
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt') {
      cvText = new TextDecoder('utf-8').decode(buffer);
    } else if (ext === 'pdf') {
      cvText = await extractTextFromPdf(buffer);
      if (!cvText || cvText.length < 50) {
        const raw = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
        cvText = raw.replace(/[^\x20-\x7EÀ-ÿ\n\r\t@.,:;!?()[\]{}"'\/\-_+=%&#*]/g, ' ').replace(/\s+/g, ' ').trim();
      }
    } else if (ext === 'docx') {
      const raw = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      const wtRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      const parts: string[] = [];
      let m;
      while ((m = wtRegex.exec(raw)) !== null) { if (m[1].trim()) parts.push(m[1]); }
      cvText = parts.join(' ').replace(/\s+/g, ' ').trim();
      if (cvText.length < 50) {
        cvText = raw.replace(/[^\x20-\x7EÀ-ÿ\n\r\t@.,:;!?()[\]{}"'\/\-_+=%&#*]/g, ' ').replace(/\s+/g, ' ').trim();
      }
    } else {
      return NextResponse.json({ error: 'Format non supporté. Utilisez PDF, DOCX ou TXT.' }, { status: 400 });
    }

    if (!cvText || cvText.length < 30) {
      return NextResponse.json(
        { error: 'Impossible de lire le fichier. Essayez un PDF textuel (non scanné) ou un fichier TXT.' },
        { status: 422 }
      );
    }

    let profile: any;

    if (provider === 'groq') {
      try {
        profile = await parseWithGroq(cvText, model);
      } catch (groqErr: any) {
        // Fallback automatique sur Gemini pour toute erreur Groq récupérable
        const isRecoverable = ['GROQ_TRUNCATED', 'GROQ_EMPTY', 'GROQ_QUOTA', 'JSON invalide'].some(e => groqErr.message?.includes(e));
        if (isRecoverable && process.env.GEMINI_API_KEY) {
          const reason = groqErr.message?.includes('GROQ_QUOTA') ? 'quota dépassé' : 'réponse invalide';
          console.warn(`[parse-cv] Groq a échoué (${reason}), fallback Gemini automatique...`);
          profile = await parseWithGemini(cvText, 'gemini-2.0-flash');
        } else {
          throw groqErr;
        }
      }
    } else {
      profile = await parseWithGemini(cvText, model);
    }

    return NextResponse.json({ profile });

  } catch (err: any) {
    console.error('[parse-cv]', err);

    let message = "Une erreur est survenue lors de l'analyse du CV.";
    const msg = err.message || '';

    if (msg.includes('GEMINI_KEY_MISSING'))  message = 'Clé API Gemini manquante (GEMINI_API_KEY).';
    else if (msg.includes('GROQ_KEY_MISSING')) message = 'Clé API Groq manquante (GROQ_API_KEY).';
    else if (msg.includes('free_tier') || msg.includes('Free tier') || (msg.includes('quota') && msg.includes('gemini'))) {
      // Extraire le temps d'attente si disponible
      const retryMatch = msg.match(/retry in ([\d.]+)s/i) || msg.match(/Please retry in ([^.]+)/i);
      const waitTime = retryMatch ? ` Réessaie dans ${Math.ceil(parseFloat(retryMatch[1]))}s.` : ' Réessaie dans quelques minutes.';
      message = `Quota gratuit Gemini épuisé.${waitTime} En attendant, tu peux saisir ton profil manuellement ou attendre le rechargement du quota.`;
    }
    else if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('429')) {
      message = 'Quotas API épuisés sur tous les providers disponibles. Réessaie dans quelques minutes.';
    }
    else if (msg.includes('401') || msg.includes('invalid')) message = "Clé API invalide. Vérifie tes variables d'environnement.";
    else if (msg.includes('JSON invalide') || msg.includes('GROQ_TRUNCATED')) message = 'Le modèle n\'a pas pu analyser le CV complètement. Réessaie ou saisis les infos manuellement.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}