// app/api/parse-cv-text/route.ts
// Reçoit du texte brut extrait d'un CV et retourne un profil structuré via IA

import { NextRequest, NextResponse } from 'next/server';
import type { AIProvider } from '@/lib/store';
import { parseApiError } from '@/lib/errors';

function buildParsePrompt(rawText: string): string {
  return `Tu es un expert en analyse de CV. Extrait les informations de ce CV et retourne UNIQUEMENT ce JSON valide, sans backticks, sans texte avant ou après :

{
  "fullName": "Prénom Nom",
  "title": "Titre professionnel",
  "email": "email@exemple.com",
  "phone": "06 00 00 00 00",
  "location": "Ville, Pays",
  "summary": "Résumé professionnel en 4-6 lignes extrait du CV",
  "github": "https://github.com/... ou chaîne vide",
  "linkedin": "https://linkedin.com/in/... ou chaîne vide",
  "portfolio": "https://... ou chaîne vide",
  "socialLinks": [],
  "experiences": [
    {
      "company": "Nom de l'entreprise",
      "position": "Poste occupé",
      "dates": "Janv. 2022 - Aujourd'hui",
      "description": "Description des missions et réalisations"
    }
  ],
  "skills": ["compétence1", "compétence2"],
  "education": [
    {
      "school": "Nom de l'école",
      "degree": "Diplôme obtenu",
      "dates": "2019 - 2022"
    }
  ],
  "projects": [
    {
      "name": "Nom du projet",
      "description": "Description",
      "technologies": "tech1, tech2",
      "dates": "2023",
      "url": ""
    }
  ],
  "languages": [{ "language": "Français", "level": "Natif" }],
  "certifications": [{ "name": "Nom", "issuer": "Organisme", "date": "2023" }],
  "interests": ["loisir1", "loisir2"]
}

Règles :
- Si une information est absente du CV, retourne "" ou []
- Ne jamais inventer d'informations non présentes
- Expériences en ordre chronologique inverse (plus récente en premier)
- Retourne UNIQUEMENT le JSON, rien d'autre

CV à analyser :
${rawText.slice(0, 7000)}`;
}

async function callGemini(text: string, model: string): Promise<any> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildParsePrompt(text) }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Gemini');
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

async function callGroq(text: string, model: string): Promise<any> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildParsePrompt(text) }],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Groq');
  const raw = data.choices?.[0]?.message?.content ?? '';
  return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

export async function POST(req: NextRequest) {
  let provider: AIProvider = 'gemini';
  try {
    const body = await req.json() as { text: string; provider: AIProvider; model: string };
    provider = body.provider ?? 'gemini';
    const { text, model } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Texte manquant' }, { status: 400 });
    }

    let profile: any;
    if (provider === 'groq') {
      profile = await callGroq(text, model);
    } else {
      profile = await callGemini(text, model);
    }

    return NextResponse.json({ profile });

  } catch (error: any) {
    console.error('[parse-cv-text]', error);
    const friendly = parseApiError(error.message || '', provider);
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}