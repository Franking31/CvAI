// app/auth/callback/route.ts
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  // Fallback : on lit l'origine depuis la requête
  return '';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard/generate';

  // Priorité à NEXT_PUBLIC_SITE_URL pour éviter les redirections vers localhost
  // quand l'app tourne derrière un reverse proxy (Render, Vercel, etc.)
  const baseUrl = getSiteUrl() || origin;

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/?error=auth`);
}