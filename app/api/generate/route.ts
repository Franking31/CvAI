// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateCVPrompt } from '@/lib/promts';
import type { AIProvider } from '@/lib/store';
import { parseApiError } from '@/lib/errors';


const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGemini(prompt: string, model: string): Promise<string> {
  const url = GEMINI_URL.replace('{MODEL}', model);
  const res = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
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
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Groq API');
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  let provider: AIProvider = 'gemini'; // ← déclaré AVANT le try
  try {
    const body = await req.json() as {
      profile: any;
      jobDescription: string;
      provider: AIProvider;
      model: string;
    };

    provider = body.provider ?? 'gemini'; // ← assigné depuis le body
    const { profile, jobDescription, model } = body;

    if (!profile || !jobDescription) {
      return NextResponse.json(
        { error: 'Profil et description de poste requis' },
        { status: 400 }
      );
    }

    const prompt = generateCVPrompt(profile, jobDescription);

    let rawText: string;
    if (provider === 'groq') {
      rawText = await callGroq(prompt, model);
    } else {
      rawText = await callGemini(prompt, model);
    }

    const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const generatedCV = JSON.parse(cleanJson);

    return NextResponse.json({ cv: generatedCV });
  } catch (error: any) {
    console.error('Erreur génération CV:', error);
    const friendlyMessage = parseApiError(error.message || '', provider);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}