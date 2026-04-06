// app/api/cover-letter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseApiError } from '@/lib/errors';
import type { AIProvider } from '@/lib/store';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildCoverLetterPrompt(profile: any, jobDescription: string): string {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Tu es un expert en rédaction de lettres de motivation professionnelles.

PROFIL DU CANDIDAT :
Nom : ${profile.fullName}
Titre : ${profile.title}
Email : ${profile.email}
Localisation : ${profile.location}
Résumé : ${profile.summary}
Expériences : ${profile.experiences?.map((e: any) => `${e.position} chez ${e.company} (${e.dates}) : ${e.description}`).join('\n')}
Compétences : ${profile.skills?.join(', ')}
Formation : ${profile.education?.map((e: any) => `${e.degree} - ${e.school} (${e.dates})`).join(', ')}
${profile.projects?.length ? `Projets : ${profile.projects.map((p: any) => p.name).join(', ')}` : ''}
${profile.languages?.length ? `Langues : ${profile.languages.map((l: any) => `${l.language} (${l.level})`).join(', ')}` : ''}

OFFRE D'EMPLOI CIBLE :
${jobDescription}

MISSION :
Rédige une lettre de motivation professionnelle, percutante et personnalisée pour cette offre.

RÈGLES :
- Commence directement par la date et lieu : "${profile.location || 'Paris'}, le ${today}"
- Puis "Madame, Monsieur," sur une nouvelle ligne
- Structure : Accroche percutante → Pourquoi ce poste / cette entreprise → Apports concrets avec chiffres et exemples → Invitation à un entretien → Formule de politesse
- Utilise des mots-clés de l'annonce naturellement
- Ton professionnel mais vivant, pas robotique
- Longueur : 3-4 paragraphes substantiels (environ 300-400 mots)
- Termine par : "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${profile.fullName}"
- NE PAS utiliser de markdown, pas de ** ou #, texte brut uniquement
- Retourne UNIQUEMENT le texte de la lettre, rien d'autre`;
}

async function callGemini(prompt: string, model: string): Promise<string> {
  const url = GEMINI_URL.replace('{MODEL}', model);
  const res = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 1500 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Gemini API');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGroq(prompt: string, model: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens: 1500,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Groq API');
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  let provider: AIProvider = 'gemini';
  try {
    const body = await req.json();
    provider = body.provider ?? 'gemini';
    const { profile, jobDescription, model } = body;

    if (!profile || !jobDescription) {
      return NextResponse.json({ error: 'Profil et offre requis' }, { status: 400 });
    }

    const prompt = buildCoverLetterPrompt(profile, jobDescription);

    const letter = provider === 'groq'
      ? await callGroq(prompt, model)
      : await callGemini(prompt, model);

    return NextResponse.json({ letter: letter.trim() });
  } catch (error: any) {
    console.error('Erreur génération lettre:', error);
    return NextResponse.json({ error: parseApiError(error.message || '', provider) }, { status: 500 });
  }
}