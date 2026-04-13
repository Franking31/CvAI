// app/dashboard/cover-letter/page.tsx
'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, FileText, Copy, Download, PenLine, User, Briefcase, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import AIProviderSelector from '@/app/components/AIProviderSelector';
import Link from 'next/link';

function ChecklistItem({ ok, label, hint, href, icon: Icon }: { ok: boolean; label: string; hint: string; href: string; icon: any }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/30'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500/10' : 'bg-muted'}`}>
        <Icon className={`w-3.5 h-3.5 ${ok ? 'text-emerald-500' : 'text-muted-foreground'}`} />
      </div>
      <p className={`text-xs font-medium flex-1 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
        {ok ? label : hint}
      </p>
      {ok
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        : <Link href={href} className="text-xs font-bold text-primary hover:underline shrink-0">Compléter →</Link>
      }
    </div>
  );
}

function buildLetterHtml(letter: string, profile: any): string {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const paragraphs = letter.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => `<p style="margin:0 0 14px 0;text-align:justify;">${l}</p>`).join('');
  return `<div style="font-family:'Garamond','EB Garamond',Georgia,serif;color:#1a1a2e;background:white;padding:48px 64px;max-width:794px;margin:0 auto;font-size:11pt;line-height:1.7;min-height:1123px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <p style="font-weight:700;font-size:13pt;margin:0;">${profile?.fullName || ''}</p>
      <p style="color:#64748b;margin:4px 0 0 0;font-size:10pt;">${profile?.title || ''}</p>
      <p style="color:#64748b;margin:3px 0 0 0;font-size:10pt;">${profile?.email || ''}</p>
      <p style="color:#64748b;margin:3px 0 0 0;font-size:10pt;">${profile?.phone || ''}</p>
      <p style="color:#64748b;margin:3px 0 0 0;font-size:10pt;">${profile?.location || ''}</p>
    </div>
    <div style="text-align:right;"><p style="color:#64748b;font-size:10pt;">${today}</p></div>
  </div>
  <div style="margin-bottom:32px;">${paragraphs}</div>
</div>`;
}

export default function CoverLetterPage() {
  const { profile, jobDescription, coverLetter, setCoverLetter, aiProvider, aiModel } = useCVStore();
  const [loading, setLoading] = useState(false);

  const hasProfile = !!profile?.fullName;
  const hasJob = !!jobDescription?.trim();
  const canGenerate = hasProfile && hasJob;
  const wordCount = coverLetter.split(' ').filter(Boolean).length;

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

  const handleCopy = () => { navigator.clipboard.writeText(coverLetter); toast.success('Copié !'); };

  const handleExport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = buildLetterHtml(coverLetter, profile);
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lettre — ${profile?.fullName || ''}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:white;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{margin:0;size:A4;}}</style></head><body>${html}<script>window.onload=()=>{window.print();}<\/script></body></html>`);
    win.document.close();
    toast.success('Export PDF ouvert !');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

        {/* ── Hero header — PAS de overflow-hidden ── */}
        <div className="relative rounded-2xl border border-border bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <PenLine className="w-4 h-4 text-violet-500" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Lettre de motivation</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Lettre de motivation</h1>
              <p className="text-sm text-muted-foreground mt-1">L'IA rédige une lettre personnalisée, adaptée à l'offre et à votre profil.</p>
            </div>
            <div className="relative z-50">
              <AIProviderSelector />
            </div>
          </div>
          {coverLetter && (
            <div className="relative mt-4">
              <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                <FileText className="w-3 h-3" /> {wordCount} mots
              </div>
            </div>
          )}
        </div>

        {/* Checklist si incomplet */}
        {!canGenerate && (
          <div className="grid sm:grid-cols-2 gap-3">
            <ChecklistItem ok={hasProfile} label="Profil rempli"          hint="Remplir le profil" href="/dashboard/profile" icon={User}     />
            <ChecklistItem ok={hasJob}     label="Offre d'emploi ajoutée" hint="Ajouter une offre" href="/dashboard/job"     icon={Briefcase} />
          </div>
        )}

        {/* Génération */}
        <div className="rounded-2xl border border-violet-500/20 bg-card shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Génération IA</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Lettre rédigée en français, personnalisée pour le poste et votre parcours.</p>
            </div>
          </div>
          <div className="px-6 pb-6 pt-1 border-t border-border/50">
            <div className="flex gap-3 mt-4 flex-wrap">
              <button onClick={handleGenerate} disabled={!canGenerate || loading}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</> : <><Sparkles className="w-4 h-4" /> {coverLetter ? 'Régénérer' : 'Générer la lettre'}</>}
              </button>
              {coverLetter && (
                <>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all">
                    <Copy className="w-3.5 h-3.5" /> Copier
                  </button>
                  <button onClick={handleExport} className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-semibold border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-all">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Éditeur */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Votre lettre</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{coverLetter ? 'Modifiez librement le texte généré.' : 'La lettre apparaîtra ici ou rédigez-la manuellement.'}</p>
            </div>
          </div>
          <div className="px-6 pb-6 pt-1 border-t border-border/50">
            <Textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder={`Paris, le ${new Date().toLocaleDateString('fr-FR')}\n\nMadame, Monsieur,\n\nJe me permets de vous adresser ma candidature...`}
              className="min-h-[480px] resize-y font-serif text-sm leading-relaxed mt-4"
            />
            {coverLetter && <p className="text-xs text-muted-foreground mt-2 text-right">{wordCount} mots · {coverLetter.length} caractères</p>}
          </div>
        </div>

        {/* Aperçu */}
        {coverLetter && (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-border/50">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Aperçu mise en page</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Rendu final tel qu'il apparaîtra à l'impression</p>
              </div>
            </div>
            <div className="p-6">
              <div className="rounded-xl overflow-hidden border shadow-lg bg-white">
                <div className="overflow-x-auto">
                  <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.3%', minHeight: '600px' }}>
                    <div dangerouslySetInnerHTML={{ __html: buildLetterHtml(coverLetter, profile) }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}