// lib/site-url.ts

/**
 * Retourne l'URL de base de l'application.
 * Priorité : NEXT_PUBLIC_SITE_URL > NEXT_PUBLIC_VERCEL_URL > window.location.origin
 *
 * NEXT_PUBLIC_SITE_URL  → ton domaine custom ou URL Vercel (à setter manuellement)
 * NEXT_PUBLIC_VERCEL_URL → injecté automatiquement par Vercel (sans https://)
 */
export function getSiteUrl(): string {
  // 1. Variable explicite (la plus fiable)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  // 2. URL Vercel automatique (attention : sans https://)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // 3. Fallback navigateur (dev local)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}