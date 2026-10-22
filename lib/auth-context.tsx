'use client';
// lib/auth-context.tsx

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from './supabase';
import { useCVStore } from './store';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  dataReady: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, dataReady: false, signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // id pour lequel les données cloud sont chargées (null = anonyme, undefined = pas encore)
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);

  const supabase = useMemo(() => createClient(), []);
  const user = session?.user ?? null;
  const userId = user?.id ?? null;
  const dataReady = !loading && loadedFor === userId;

  // 1) Suivi de la session : AUCUN appel Supabase dans ce callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2) Chargement des données quand le compte change (login, logout, switch)
  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    (async () => {
      const store = useCVStore.getState();

      // Données locales d'un AUTRE compte (ou après déconnexion) → on efface
      if (store.ownerId && store.ownerId !== userId) {
        store.resetAll();
      }

      if (userId) {
        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('[auth] Erreur chargement user_data:', error.message);
        } else {
          const s = useCVStore.getState();
          if (data?.profile)          s.setProfile(data.profile);
          if (data?.job_description)  s.setJobDescription(data.job_description);
          if (data?.generated_cv)     s.setGeneratedCV(data.generated_cv);
          if (data?.keyword_analysis) s.setKeywordAnalysis(data.keyword_analysis);
          if (data?.conversation_history?.length) s.setConversationHistory(data.conversation_history);
          if (data?.job_url)          s.setJobUrl(data.job_url);
          if (data?.ai_provider)      s.setAIProvider(data.ai_provider);
          if (data?.ai_model)         s.setAIModel(data.ai_model);
          s.setOwnerId(userId);       // à partir de là, les données locales sont à ce compte
        }
      }

      if (!cancelled) setLoadedFor(userId);
    })();

    return () => { cancelled = true; };
  }, [userId, loading, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut(); // l'effet 2 vide le store quand userId passe à null
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, dataReady, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);