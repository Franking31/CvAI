'use client';
// lib/auth-context.tsx

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from './supabase';
import { useCVStore } from './store';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  dataReady: boolean; // ← nouveau : true quand les données cloud sont chargées
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  dataReady: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // PGRST116 = aucune ligne trouvée (nouveau user) — pas une vraie erreur
        if (error.code !== 'PGRST116') {
          console.error('[auth] Erreur chargement user_data:', error.message);
        }
        return;
      }

      if (!data) return;

      // On récupère l'état LOCAL actuel pour ne pas écraser
      // des données saisies localement si Supabase est plus ancien
      const store = useCVStore.getState();

      // Stratégie : Supabase gagne sauf si la valeur locale est plus récente
      // Pour simplifier : Supabase gagne toujours (source de vérité cloud)
      // mais on ne touche pas aux champs null/undefined/vides
      if (data.profile)              store.setProfile(data.profile);
      if (data.job_description)      store.setJobDescription(data.job_description);
      if (data.generated_cv)         store.setGeneratedCV(data.generated_cv);
      if (data.keyword_analysis)     store.setKeywordAnalysis(data.keyword_analysis);
      if (data.conversation_history?.length) store.setConversationHistory(data.conversation_history);
      if (data.job_url)              store.setJobUrl(data.job_url);
      if (data.ai_provider)          store.setAIProvider(data.ai_provider);
      if (data.ai_model)             store.setAIModel(data.ai_model);
    } catch (e) {
      console.error('[auth] Exception loadUserData:', e);
    }
  }, [supabase]);

  useEffect(() => {
    let initialized = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserData(session.user.id);
      }

      setLoading(false);
      setDataReady(true);
      initialized = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Ne recharger depuis Supabase que si c'est un vrai changement d'auth
          // (nouveau login), pas juste un refresh de token
          if (!initialized || _event === 'SIGNED_IN') {
            await loadUserData(session.user.id);
          }
        }

        setLoading(false);
        setDataReady(true);
        initialized = true;
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    useCVStore.getState().resetAll();
    setDataReady(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, dataReady, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);