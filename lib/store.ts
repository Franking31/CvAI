// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfileForm } from './validation';

export type AIProvider = 'gemini' | 'groq';

export const AI_PROVIDERS: Record<AIProvider, { label: string; models: string[]; defaultModel: string }> = {
  gemini: {
  label: 'Google Gemini',
  models: ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-pro'],
  defaultModel: 'gemini-2.0-flash',
},
  groq: {
    label: 'Groq',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    defaultModel: 'llama-3.3-70b-versatile',
  },
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type KeywordAnalysis = {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  languages: string[];
  experience: string[];
  education: string[];
  mustHave: string[];
  niceToHave: string[];
  summary: string;
};

type CVStore = {
  profile: UserProfileForm | null;
  jobDescription: string;
  generatedCV: any | null;
  keywordAnalysis: KeywordAnalysis | null;
  conversationHistory: Message[];
  aiProvider: AIProvider;
  aiModel: string;
  jobUrl: string;
  
  

  setProfile: (profile: UserProfileForm) => void;
  setJobDescription: (desc: string) => void;
  setGeneratedCV: (cv: any) => void;
  setKeywordAnalysis: (analysis: KeywordAnalysis) => void;
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  clearConversation: () => void;
  resetAll: () => void;
  setAIProvider: (provider: AIProvider) => void;
  setAIModel: (model: string) => void;
  setJobUrl: (url: string) => void;
  
};

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      profile: null,
      jobDescription: '',
      generatedCV: null,
      keywordAnalysis: null,
      conversationHistory: [],
      aiProvider: 'gemini',
      aiModel: AI_PROVIDERS.gemini.defaultModel,
      jobUrl: '',

      setProfile: (profile) => set({ profile }),
      setJobDescription: (desc) => set({ jobDescription: desc }),
      setGeneratedCV: (cv) => set({ generatedCV: cv }),
      setKeywordAnalysis: (analysis) => set({ keywordAnalysis: analysis }),
      setJobUrl: (url) => set({ jobUrl: url }),

      addMessage: (message) =>
        set((state) => ({
          conversationHistory: [
            ...state.conversationHistory,
            { ...message, timestamp: Date.now() },
          ],
        })),

      clearConversation: () => set({ conversationHistory: [] }),

      setAIProvider: (provider) =>
        set({ aiProvider: provider, aiModel: AI_PROVIDERS[provider].defaultModel }),

      setAIModel: (model) => set({ aiModel: model }),

      resetAll: () =>
        set({
          generatedCV: null,
          jobDescription: '',
          keywordAnalysis: null,
          conversationHistory: [],
        }),
    }),
    {
      name: 'cv-generator-storage',
      partialize: (state) => ({
        profile: state.profile,
        jobDescription: state.jobDescription,
        generatedCV: state.generatedCV,
        keywordAnalysis: state.keywordAnalysis,
        conversationHistory: state.conversationHistory,
        aiProvider: state.aiProvider,
        aiModel: state.aiModel,
        jobUrl: state.jobUrl,
      }),
    }
  )
);