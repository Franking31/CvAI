'use client';
// app/dashboard/generate/page.tsx

import { useState } from 'react';
import { useCVStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertCircle, CheckCircle, Loader2, RefreshCw, Lock } from 'lucide-react';
import { toast } from 'sonner';
import CVPreview from '@/app/components/cv/CVPreview';
import AIProviderSelector from '@/app/components/AIProviderSelector';
import AuthModal from '@/app/components/AuthModal';

export default function GeneratePage() {
  const { profile, jobDescription, generatedCV, setGeneratedCV, aiProvider, aiModel } = useCVStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const hasProfile = !!profile?.fullName;
  const hasJob = !!jobDescription?.trim();
  const canGenerate = hasProfile && hasJob;

  const handleGenerateClick = () => {
    // Gate : si non connecté, affiche la modale auth
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    generate();
  };

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

  // Quand l'auth modal se ferme, si l'user est maintenant connecté → on génère
  const handleAuthClose = () => {
    setShowAuthModal(false);
    // On vérifie via un léger délai que le state auth s'est mis à jour
    setTimeout(() => {
      if (useCVStore.getState().profile) generate();
    }, 300);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Générer mon CV adapté</h1>
            <p className="text-muted-foreground">L'IA adapte votre profil à l'offre et optimise pour les ATS.</p>
          </div>
          <AIProviderSelector />
        </div>

        {/* Checklist */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <ChecklistItem ok={hasProfile} label="Profil rempli" href="/dashboard/profile" hint="Remplir le profil" />
          <ChecklistItem ok={hasJob} label="Offre d'emploi ajoutée" href="/dashboard/job" hint="Ajouter une offre" />
        </div>

        {/* Bouton génération */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-primary" /> Génération IA
            </CardTitle>
            <CardDescription>
              L'IA va analyser l'offre et réécrire vos expériences pour maximiser votre correspondance.
              {!user && (
                <span className="flex items-center gap-1 mt-1 text-amber-600 text-xs">
                  <Lock className="w-3 h-3" />
                  Une connexion est requise pour générer votre CV et sauvegarder vos données.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              onClick={handleGenerateClick}
              disabled={!canGenerate || loading}
              size="lg"
              className="flex-1"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération en cours...</>
              ) : !user ? (
                <><Lock className="mr-2 h-4 w-4" />Se connecter pour générer</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Générer mon CV adapté</>
              )}
            </Button>
            {generatedCV && user && (
              <Button onClick={generate} variant="outline" size="lg" disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" /> Regénérer
              </Button>
            )}
          </CardContent>
        </Card>

        {generatedCV && <CVPreview cv={generatedCV} />}
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={handleAuthClose}
          reason="🎯 Connectez-vous pour générer votre CV et sauvegarder toutes vos données dans le cloud."
        />
      )}
    </>
  );
}

function ChecklistItem({ ok, label, hint, href }: { ok: boolean; label: string; hint: string; href: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
      ok ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-orange-200 bg-orange-50 dark:bg-orange-950'
    }`}>
      {ok
        ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
        : <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
      }
      <span className={ok ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}>
        {ok ? `✓ ${label}` : <a href={href} className="underline">{hint} →</a>}
      </span>
    </div>
  );
}