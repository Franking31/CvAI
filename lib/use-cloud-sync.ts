'use client';
// lib/use-cloud-sync.ts

import { useEffect, useRef, useMemo } from 'react';
import { createClient } from './supabase';
import { useAuth } from './auth-context';
import { useCVStore } from './store';

/**
 * Ce hook observe le store Zustand et synchronise automatiquement
 * les données vers Supabase dès que l'utilisateur est connecté.
 * Debounce de 1.5s pour ne pas spammer l'API à chaque frappe.
 */
export function useCloudSync() {
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Fix: mémoïser le client Supabase pour éviter de le recréer à chaque render
  // (sinon la dépendance [user, supabase] change en boucle et détruit/recrée
  //  l'abonnement en permanence sans jamais déclencher le vrai upsert)
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!user) return;

    const unsub = useCVStore.subscribe((state) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        const { error } = await supabase.from('user_data').upsert(
          {
            user_id: user.id,
            profile: state.profile,
            job_description: state.jobDescription,
            generated_cv: state.generatedCV,
            keyword_analysis: state.keywordAnalysis,
            conversation_history: state.conversationHistory,
            job_url: state.jobUrl,
            ai_provider: state.aiProvider,
            ai_model: state.aiModel,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (error) {
          console.error('[cloud-sync] Erreur upsert Supabase:', error.message, error);
        } else {
          console.log('[cloud-sync] Données synchronisées pour', user.email);
        }
      }, 1500);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, supabase]);
}