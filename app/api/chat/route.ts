// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildGeminiHistory, buildGroqMessages } from '../../../lib/promts';
import type { AIProvider } from '@/lib/store';
import { parseApiError } from '@/lib/errors';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGemini(
  profile: any,
  jobDescription: string,
  history: any[],
  message: string,
  model: string
): Promise<string> {
  const { systemText, contents } = buildGeminiHistory(profile, jobDescription, history, message);
  const url = GEMINI_URL.replace('{MODEL}', model);

  const res = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Gemini API');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGroq(
  profile: any,
  jobDescription: string,
  history: any[],
  message: string,
  model: string
): Promise<string> {
  const messages = buildGroqMessages(profile, jobDescription, history, message);

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Groq API');
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  let provider: AIProvider = 'gemini';
  try {
    const body = await req.json() as {
      profile: any;
      jobDescription: string;
      history: any[];
      message: string;
      provider: AIProvider;
      model: string;
    };

    provider = body.provider ?? 'gemini';
    const { profile, jobDescription, history, message, model } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    let reply: string;
    if (provider === 'groq') {
      reply = await callGroq(profile, jobDescription, history || [], message, model);
    } else {
      reply = await callGemini(profile, jobDescription, history || [], message, model);
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Erreur chat:', error);
    const friendlyMessage = parseApiError(error.message || '', provider);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}