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
  coverLetter: string;           // ← NOUVEAU
  photoDataUrl: string;          // ← NOUVEAU (base64 de la photo)
  keywordAnalysis: KeywordAnalysis | null;
  conversationHistory: Message[];
  aiProvider: AIProvider;
  aiModel: string;
  jobUrl: string;

  setProfile: (profile: UserProfileForm) => void;
  setJobDescription: (desc: string) => void;
  setGeneratedCV: (cv: any) => void;
  setCoverLetter: (letter: string) => void;   // ← NOUVEAU
  setPhotoDataUrl: (url: string) => void;     // ← NOUVEAU
  setKeywordAnalysis: (analysis: KeywordAnalysis) => void;
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  setConversationHistory: (history: Message[]) => void;
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
      coverLetter: '',
      photoDataUrl: '',
      keywordAnalysis: null,
      conversationHistory: [],
      aiProvider: 'gemini',
      aiModel: AI_PROVIDERS.gemini.defaultModel,
      jobUrl: '',

      setProfile: (profile) => set({ profile }),
      setJobDescription: (desc) => set({ jobDescription: desc }),
      setGeneratedCV: (cv) => set({ generatedCV: cv }),
      setCoverLetter: (letter) => set({ coverLetter: letter }),
      setPhotoDataUrl: (url) => set({ photoDataUrl: url }),
      setKeywordAnalysis: (analysis) => set({ keywordAnalysis: analysis }),
      setJobUrl: (url) => set({ jobUrl: url }),

      addMessage: (message) =>
        set((state) => ({
          conversationHistory: [
            ...state.conversationHistory,
            { ...message, timestamp: Date.now() },
          ],
        })),

      setConversationHistory: (history) => set({ conversationHistory: history }),
      clearConversation: () => set({ conversationHistory: [] }),

      setAIProvider: (provider) =>
        set({ aiProvider: provider, aiModel: AI_PROVIDERS[provider].defaultModel }),

      setAIModel: (model) => set({ aiModel: model }),

      resetAll: () =>
        set({
          profile: null,
          generatedCV: null,
          jobDescription: '',
          jobUrl: '',
          keywordAnalysis: null,
          conversationHistory: [],
          coverLetter: '',
          photoDataUrl: '',
        }),
    }),
    {
      name: 'cv-generator-storage',
      partialize: (state) => ({
        profile: state.profile,
        jobDescription: state.jobDescription,
        generatedCV: state.generatedCV,
        coverLetter: state.coverLetter,
        // On ne persiste PAS photoDataUrl car c'est trop lourd pour localStorage
        keywordAnalysis: state.keywordAnalysis,
        conversationHistory: state.conversationHistory,
        aiProvider: state.aiProvider,
        aiModel: state.aiModel,
        jobUrl: state.jobUrl,
      }),
    }
  )
);