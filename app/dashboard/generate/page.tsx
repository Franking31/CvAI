// app/dashboard/generate/page.tsx
'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, CheckCircle2, Loader2, RefreshCw, Lock, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import CVPreview from '@/app/components/cv/CVPreview';
import AIProviderSelector from '@/app/components/AIProviderSelector';
import AuthModal from '@/app/components/AuthModal';
import Link from 'next/link';

function ChecklistItem({ ok, label, hint, href, icon: Icon }: { ok: boolean; label: string; hint: string; href: string; icon: any }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/30 hover:border-primary/30'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500/10' : 'bg-muted'}`}>
        <Icon className={`w-4 h-4 ${ok ? 'text-emerald-500' : 'text-muted-foreground'}`} />
      </div>
      <p className={`text-sm font-medium flex-1 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
        {ok ? label : hint}
      </p>
      {ok
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        : <Link href={href} className="text-xs font-semibold text-primary hover:underline shrink-0">Compléter →</Link>
      }
    </div>
  );
}

export default function GeneratePage() {
  const { profile, jobDescription, generatedCV, setGeneratedCV, aiProvider, aiModel } = useCVStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const hasProfile = !!profile?.fullName;
  const hasJob = !!jobDescription?.trim();
  const canGenerate = hasProfile && hasJob;

  const handleGenerateClick = () => { if (!user) { setShowAuthModal(true); return; } generate(); };

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, jobDescription, provider: aiProvider, model: aiModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de génération');
      setGeneratedCV(data.cv);
      toast.success('CV généré !', { description: 'Choisissez un template ci-dessous.' });
    } catch (err: any) {
      toast.error('Erreur lors de la génération', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    setTimeout(() => { if (useCVStore.getState().profile) generate(); }, 300);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">

          {/* ── Hero header — PAS de overflow-hidden ── */}
          <div className="relative rounded-2xl border border-border bg-card p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none rounded-2xl" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Génération</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Générer mon CV adapté</h1>
                <p className="text-sm text-muted-foreground mt-1">L'IA adapte votre profil à l'offre et optimise chaque ligne pour les filtres ATS.</p>
              </div>
              <div className="relative z-50">
                <AIProviderSelector />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="grid sm:grid-cols-2 gap-3">
            <ChecklistItem ok={hasProfile} label="Profil rempli"          hint="Remplir le profil" href="/dashboard/profile" icon={User}     />
            <ChecklistItem ok={hasJob}     label="Offre d'emploi ajoutée" hint="Ajouter une offre" href="/dashboard/job"     icon={Briefcase} />
          </div>

          {/* Generate Card */}
          <div className="rounded-2xl border border-primary/20 bg-card shadow-sm">
            <div className="px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Génération IA</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  L'IA réécrit vos expériences avec les mots-clés exacts de l'offre.
                  {!user && <span className="ml-1 inline-flex items-center gap-1 text-amber-500"><Lock className="w-3 h-3" /> Connexion requise</span>}
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-1 border-t border-border/50">
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleGenerateClick}
                  disabled={!canGenerate || loading}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
                    : !user ? <><Lock className="w-4 h-4" /> Se connecter pour générer</>
                    : <><Sparkles className="w-4 h-4" /> Générer mon CV adapté</>}
                </button>
                {generatedCV && user && (
                  <button onClick={generate} disabled={loading}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all disabled:opacity-40">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Regénérer
                  </button>
                )}
              </div>
              {!canGenerate && <p className="text-xs text-muted-foreground mt-3 text-center">Complétez les étapes ci-dessus pour activer la génération</p>}
            </div>
          </div>

          {/* CV Preview */}
          {generatedCV && (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 border-b border-border/50">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Votre CV généré</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Personnalisez le template, le style et exportez en PDF</p>
                </div>
              </div>
              <div className="p-6">
                <CVPreview cv={generatedCV} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={handleAuthClose} reason="🎯 Connectez-vous pour générer votre CV et sauvegarder toutes vos données dans le cloud." />
      )}
    </>
  );
}