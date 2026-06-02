// app/api/generate-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseApiError } from '@/lib/errors';
import { AIProvider } from '@/lib/store';

const SYSTEM_PROMPT = `Tu es un expert RH et formateur en recrutement tech francophone.
À partir d'une description de poste et de ses mots-clés extraits, génère un test QCM d'entretien structuré.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires.
Le JSON doit respecter exactement ce schéma :
{
  "title": "Test QCM — <Titre du poste>",
  "poste": "<Titre du poste court>",
  "date": "<date ISO aujourd'hui>",
  "totalQuestions": <nombre entier>,
  "estimatedMinutes": <nombre entier>,
  "sections": [
    {
      "label": "<Nom de la section>",
      "color": "<blue|purple|orange|green>",
      "icon": "<code|heart|star|book>",
      "questions": [
        {
          "question": "<Question claire et précise>",
          "choices": [
            "<Choix A>",
            "<Choix B>",
            "<Choix C>",
            "<Choix D>"
          ],
          "correctIndex": <0|1|2|3>,
          "explanation": "<Explication de la bonne réponse, 1-2 phrases concrètes>",
          "durationMin": <1-3>
        }
      ]
    }
  ]
}
Règles :
- 4 sections obligatoires :
  1. "Compétences techniques" (color: blue, icon: code) — 4 à 5 questions basées sur les compétences techniques et outils de l'offre
  2. "Soft skills & comportemental" (color: purple, icon: heart) — 3 à 4 questions situationnelles avec 4 réponses plausibles
  3. "Mise en situation" (color: orange, icon: star) — 2 à 3 questions de cas pratiques liés au poste
  4. "Culture & motivation" (color: green, icon: book) — 2 à 3 questions sur la motivation et l'adéquation culturelle
- Chaque question a EXACTEMENT 4 choix (choices), un seul correct (correctIndex 0-3)
- Les mauvais choix doivent être plausibles, pas absurdes
- Les explanations doivent être concrètes et pédagogiques
- Le français correct, ton professionnel mais accessible
- totalQuestions = somme de toutes les questions
- estimatedMinutes = totalQuestions * 2 (arrondi)`;

async function callGemini(model: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY manquante');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 3000, temperature: 0.3 },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `Gemini error ${res.status}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callGroq(model: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY manquante');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `Groq error ${res.status}`);
  return data.choices?.[0]?.message?.content ?? '';
}

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, keywordAnalysis, provider, model } = (await req.json()) as {
      jobDescription?: string;
      keywordAnalysis: Record<string, string[]> & { summary?: string };
      provider: AIProvider;
      model: string;
    };

    if (!keywordAnalysis) {
      return NextResponse.json({ error: 'keywordAnalysis requis' }, { status: 400 });
    }

    const userPrompt = `
Offre d'emploi :
${jobDescription || '(non fournie)'}

Mots-clés extraits :
- Compétences techniques : ${keywordAnalysis.technicalSkills?.join(', ') || '-'}
- Soft skills : ${keywordAnalysis.softSkills?.join(', ') || '-'}
- Outils : ${keywordAnalysis.tools?.join(', ') || '-'}
- Langues : ${keywordAnalysis.languages?.join(', ') || '-'}
- Incontournables : ${keywordAnalysis.mustHave?.join(', ') || '-'}
- Appréciés : ${keywordAnalysis.niceToHave?.join(', ') || '-'}
- Résumé du poste : ${keywordAnalysis.summary || '-'}

Génère le test QCM JSON complet.
    `.trim();

    let raw: string;

    if (provider === 'gemini') {
      raw = await callGemini(model, userPrompt);
    } else if (provider === 'groq') {
      raw = await callGroq(model, userPrompt);
    } else {
      return NextResponse.json({ error: `Provider inconnu : ${provider}` }, { status: 400 });
    }

    const cleaned = raw.replace(/```json|```/g, '').trim();
    const test = JSON.parse(cleaned);

    if (!test.date) test.date = new Date().toLocaleDateString('fr-FR');

    return NextResponse.json({ test });
  } catch (err: any) {
    console.error('[generate-test]', err);
    const provider = (await req.json().catch(() => ({})) as any)?.provider ?? 'IA';
    const friendlyError = parseApiError(err.message ?? '', provider);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}