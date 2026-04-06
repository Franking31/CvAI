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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fix: mémoïser le client pour éviter de le recréer à chaque render
  const supabase = useMemo(() => createClient(), []);

  const loadUserData = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 = no row found, ce n'est pas vraiment une erreur (nouveau user)
      if (error.code !== 'PGRST116') {
        console.error('[auth] Erreur chargement user_data:', error.message);
      }
      return;
    }

    if (!data) return;

    const store = useCVStore.getState();
    if (data.profile)              store.setProfile(data.profile);
    if (data.job_description)      store.setJobDescription(data.job_description);
    if (data.generated_cv)         store.setGeneratedCV(data.generated_cv);
    if (data.keyword_analysis)     store.setKeywordAnalysis(data.keyword_analysis);
    if (data.conversation_history) store.setConversationHistory(data.conversation_history);
    if (data.job_url)              store.setJobUrl(data.job_url);
    if (data.ai_provider)          store.setAIProvider(data.ai_provider);
    if (data.ai_model)             store.setAIModel(data.ai_model);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    useCVStore.getState().resetAll();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);