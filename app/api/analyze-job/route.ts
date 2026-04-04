// app/api/analyze-job/route.ts
import { parseApiError } from '@/lib/errors';
import { NextRequest, NextResponse } from 'next/server';

// ─── Prompt ──────────────────────────────────────────────────────────────────

function buildAnalyzePrompt(jobDescription: string): string {
  return `Tu es un expert ATS et recrutement. Analyse cette offre d'emploi et retourne UNIQUEMENT ce JSON valide, sans backticks, sans texte avant ou après :

{
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["soft1", "soft2"],
  "tools": ["outil1", "outil2"],
  "languages": ["Français", "Anglais"],
  "experience": ["5 ans en développement", "management d'équipe"],
  "education": ["Bac+5 Informatique"],
  "mustHave": ["compétence absolument requise"],
  "niceToHave": ["compétence appréciée mais optionnelle"],
  "summary": "Résumé du poste en 1 phrase."
}

Offre d'emploi :
${jobDescription}

Retourne UNIQUEMENT le JSON, rien d'autre.`;
}

// ─── Handlers ────────────────────────────────────────────────────────────────

async function analyzeWithGemini(jobDescription: string, model: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Clé API Gemini manquante');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildAnalyzePrompt(jobDescription) }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erreur Gemini');
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return JSON.parse(text.trim());
}

async function analyzeWithGroq(jobDescription: string, model: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Clé API Groq manquante');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 1500,
      messages: [{ role: 'user', content: buildAnalyzePrompt(jobDescription) }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erreur Groq');
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  return JSON.parse(text.trim());
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let provider = 'gemini';
  try {
    const body = await req.json();
    provider = body.provider ?? 'gemini';
    const { jobDescription, model } = body;

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Offre manquante' }, { status: 400 });
    }

    let analysis: any;
    if (provider === 'groq') {
      analysis = await analyzeWithGroq(jobDescription, model || 'llama-3.3-70b-versatile');
    } else {
      analysis = await analyzeWithGemini(jobDescription, model || 'gemini-2.0-flash');
    }

    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error('[analyze-job]', err);
    const friendlyMessage = parseApiError(err.message || '', provider);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}