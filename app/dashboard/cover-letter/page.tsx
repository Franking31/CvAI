'use client';
// app/dashboard/cover-letter/page.tsx

import { useState } from 'react';
import { useCVStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, FileText, Copy, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AIProviderSelector from '@/app/components/AIProviderSelector';
import Link from 'next/link';

export default function CoverLetterPage() {
  const {
    profile,
    jobDescription,
    coverLetter,
    setCoverLetter,
    aiProvider,
    aiModel,
  } = useCVStore();

  const [loading, setLoading] = useState(false);

  const hasProfile = !!profile?.fullName;
  const hasJob = !!jobDescription?.trim();
  const canGenerate = hasProfile && hasJob;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, jobDescription, provider: aiProvider, model: aiModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de génération');
      setCoverLetter(data.letter);
      toast.success('Lettre de motivation générée !');
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success('Copié dans le presse-papier !');
  };

  const handleExport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = buildLetterHtml(coverLetter, profile);
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Lettre de motivation — ${profile?.fullName || ''}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: white; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0; size: A4; }
        }
      </style>
    </head><body>${html}<script>window.onload=()=>{window.print();}<\/script></body></html>`);
    win.document.close();
    toast.success('Export PDF ouvert !');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Lettre de motivation</h1>
          <p className="text-muted-foreground">
            L'IA rédige une lettre personnalisée, adaptée à l'offre et à votre profil.
          </p>
        </div>
        <AIProviderSelector />
      </div>

      {/* Checklist */}
      {!canGenerate && (
        <div className="grid sm:grid-cols-2 gap-3">
          {!hasProfile && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-orange-700 dark:text-orange-300">
                <Link href="/dashboard/profile" className="underline">Remplir le profil →</Link>
              </span>
            </div>
          )}
          {!hasJob && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-orange-700 dark:text-orange-300">
                <Link href="/dashboard/job" className="underline">Ajouter une offre →</Link>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Génération */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-primary" />
            Génération IA
          </CardTitle>
          <CardDescription>
            La lettre sera rédigée en français, personnalisée pour le poste et votre parcours.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={handleGenerate} disabled={!canGenerate || loading} size="lg" className="flex-1">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération en cours...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />Générer la lettre</>
            )}
          </Button>
          {coverLetter && (
            <Button onClick={handleGenerate} variant="outline" size="lg" disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Régénérer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Éditeur de lettre */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Votre lettre de motivation</CardTitle>
              <CardDescription>
                {coverLetter
                  ? 'Modifiez librement le texte généré.'
                  : 'La lettre apparaîtra ici après génération. Vous pouvez aussi la rédiger manuellement.'}
              </CardDescription>
            </div>
            {coverLetter && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-1" /> Copier
                </Button>
                <Button size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1" /> PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder={`Paris, le ${new Date().toLocaleDateString('fr-FR')}\n\nMadame, Monsieur,\n\nJe me permets de vous adresser ma candidature...`}
            className="min-h-[500px] resize-y font-serif text-sm leading-relaxed"
          />
          {coverLetter && (
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {coverLetter.split(' ').length} mots · {coverLetter.length} caractères
            </p>
          )}
        </CardContent>
      </Card>

      {/* Aperçu */}
      {coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aperçu mise en page</CardTitle>
            <CardDescription>Rendu final tel qu'il apparaîtra à l'impression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden border shadow-lg bg-white">
              <div className="overflow-x-auto">
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.3%', minHeight: '600px' }}>
                  <div dangerouslySetInnerHTML={{ __html: buildLetterHtml(coverLetter, profile) }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Rendu HTML de la lettre ──────────────────────────────────────────────────

function buildLetterHtml(letter: string, profile: any): string {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const paragraphs = letter
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `<p style="margin:0 0 14px 0;text-align:justify;">${l}</p>`)
    .join('');

  return `<div style="font-family:'Garamond','EB Garamond',Georgia,serif;color:#1a1a2e;background:white;padding:48px 64px;max-width:794px;margin:0 auto;font-size:11pt;line-height:1.7;min-height:1123px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <p style="font-weight:700;font-size:13pt;margin:0;">${profile?.fullName || ''}</p>
      <p style="color:#64748b;margin:4px 0 0 0;font-size:10pt;">${profile?.title || ''}</p>
      <p style="color:#64748b;margin:3px 0 0 0;font-size:10pt;">${profile?.email || ''}</p>
      <p style="color:#64748b;margin:3px 0 0 0;font-size:10pt;">${profile?.phone || ''}</p>
      <p style="color:#64748b;margin:3px 0 0 0;font-size:10pt;">${profile?.location || ''}</p>
    </div>
    <div style="text-align:right;">
      <p style="color:#64748b;font-size:10pt;">${today}</p>
    </div>
  </div>
  <div style="margin-bottom:32px;">
    ${paragraphs}
  </div>
</div>`;
}