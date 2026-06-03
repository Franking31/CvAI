'use client';
// lib/use-cloud-sync.ts

import { useEffect, useRef, useMemo } from 'react';
import { createClient } from './supabase';
import { useAuth } from './auth-context';
import { useCVStore } from './store';

/**
 * Synchronise le store Zustand → Supabase avec debounce 2s.
 * 
 * IMPORTANT : on ignore les premiers changements dus au chargement
 * initial (loadUserData dans auth-context), pour ne pas déclencher
 * un upsert inutile ou écraser des données cloud avec des données locales.
 */
export function useCloudSync() {
  const { user, dataReady } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Compteur pour ignorer les N premiers changements (chargement initial)
  const skipCountRef = useRef(0);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Réinitialiser le skip counter quand user change
    skipCountRef.current = 0;
  }, [user?.id]);

  useEffect(() => {
    // N'activer la sync que quand les données cloud sont prêtes
    if (!user || !dataReady) return;

    // Après le chargement initial, les premières mises à jour du store
    // viennent de loadUserData elle-même → on les ignore pour éviter
    // de réécrire immédiatement ce qu'on vient de lire
    const SKIP_INITIAL = 3;

    const unsub = useCVStore.subscribe((state) => {
      // Ignorer les premiers changements (chargement initial)
      if (skipCountRef.current < SKIP_INITIAL) {
        skipCountRef.current++;
        return;
      }

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
      }, 2000);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, dataReady, supabase]);
}