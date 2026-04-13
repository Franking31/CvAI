// app/dashboard/job/page.tsx
'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Briefcase, Tags, Link2, ExternalLink, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import AIProviderSelector from '@/app/components/AIProviderSelector';

const colorMap: Record<string, { pill: string; dot: string; label: string }> = {
  blue:   { pill: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',     dot: 'bg-blue-500',         label: 'text-blue-600 dark:text-blue-400'    },
  purple: { pill: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20', dot: 'bg-violet-500',   label: 'text-violet-600 dark:text-violet-400' },
  orange: { pill: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20', dot: 'bg-orange-500',   label: 'text-orange-600 dark:text-orange-400' },
  green:  { pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500', label: 'text-emerald-600 dark:text-emerald-400' },
  red:    { pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',     dot: 'bg-rose-500',         label: 'text-rose-600 dark:text-rose-400'    },
  gray:   { pill: 'bg-muted text-muted-foreground border border-border',                            dot: 'bg-muted-foreground', label: 'text-muted-foreground'               },
};

function KeywordGroup({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (!items?.length) return null;
  const c = colorMap[color];
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
        <p className={`text-xs font-bold uppercase tracking-wider ${c.label}`}>{label}</p>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <span key={item} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${c.pill}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function JobPage() {
  const { jobDescription, setJobDescription, keywordAnalysis, setKeywordAnalysis, aiProvider, aiModel, jobUrl, setJobUrl } = useCVStore();
  const [loading, setLoading]           = useState(false);
  const [localJob, setLocalJob]         = useState(jobDescription);
  const [saved, setSaved]               = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(true);

  const handleSave = () => {
    setJobDescription(localJob);
    setSaved(true);
    toast.success('Offre enregistrée !');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!localJob.trim() && !jobUrl) { toast.error("Collez une description ou ajoutez un lien d'offre"); return; }
    setJobDescription(localJob);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: localJob, jobUrl: jobUrl || null, provider: aiProvider, model: aiModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'analyse");
      setKeywordAnalysis(data.analysis);
      setAnalysisOpen(true);
      toast.success('Offre analysée avec succès !');
    } catch (err: any) {
      toast.error("Erreur lors de l'analyse", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const totalKeywords = keywordAnalysis
    ? [keywordAnalysis.technicalSkills, keywordAnalysis.softSkills, keywordAnalysis.tools, keywordAnalysis.languages, keywordAnalysis.mustHave, keywordAnalysis.niceToHave].flat().length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* ── Hero header — PAS de overflow-hidden ── */}
        <div className="relative rounded-2xl border border-border bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Offre d'emploi</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Offre d'emploi cible</h1>
              <p className="text-sm text-muted-foreground mt-1">Collez l'annonce ou son lien — l'IA en extrait les mots-clés ATS pour adapter votre CV.</p>
            </div>
            {/* z-50 pour passer au-dessus du reste */}
            <div className="relative z-50">
              <AIProviderSelector />
            </div>
          </div>
          {keywordAnalysis && (
            <div className="relative mt-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Tags className="w-3 h-3" /> {totalKeywords} mots-clés extraits
              </div>
              <span className="text-xs text-muted-foreground">{keywordAnalysis.summary}</span>
            </div>
          )}
        </div>

        {/* Input Card */}
        <div className="rounded-2xl border border-amber-500/20 bg-card shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Description du poste</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Lien OU description complète</p>
            </div>
          </div>
          <div className="px-6 pb-6 pt-1 border-t border-border/50 space-y-5">
            <div className="space-y-1.5 mt-4">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-amber-500" /> Lien de l'offre (optionnel)
              </Label>
              <div className="flex gap-2">
                <Input placeholder="https://www.linkedin.com/jobs/view/..." value={jobUrl} onChange={e => setJobUrl(e.target.value)} type="url" className="h-9 text-sm" />
                {jobUrl && (
                  <a href={jobUrl} target="_blank" rel="noopener noreferrer" className="h-9 px-3 flex items-center gap-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" /> Voir
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Si vous renseignez le lien, la description peut rester vide.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description complète de l'offre</Label>
              <Textarea placeholder="Collez ici l'intégralité de l'annonce (missions, exigences, compétences...)" className="min-h-[220px] resize-y text-sm" value={localJob} onChange={e => setLocalJob(e.target.value)} />
              {localJob && <p className="text-xs text-muted-foreground text-right">{localJob.split(' ').filter(Boolean).length} mots</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={!localJob.trim() && !jobUrl}
                className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${saved ? 'bg-emerald-500 text-white border-transparent' : 'border-border bg-background hover:bg-muted text-foreground'}`}>
                <Save className="w-4 h-4" /> {saved ? 'Enregistré !' : 'Enregistrer'}
              </button>
              <button onClick={handleAnalyze} disabled={(!localJob.trim() && !jobUrl) || loading}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse...</> : <><Sparkles className="w-4 h-4" /> Analyser avec l'IA</>}
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {keywordAnalysis && (
          <div className="rounded-2xl border border-emerald-500/20 bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-muted/30 transition-colors" onClick={() => setAnalysisOpen(v => !v)}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Tags className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Mots-clés extraits</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{totalKeywords} mots-clés identifiés</p>
                </div>
              </div>
              {analysisOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            {analysisOpen && (
              <div className="px-6 pb-6 pt-1 border-t border-border/50 space-y-5 mt-1">
                <KeywordGroup label="Compétences techniques" items={keywordAnalysis.technicalSkills} color="blue"   />
                <KeywordGroup label="Soft skills"            items={keywordAnalysis.softSkills}      color="purple" />
                <KeywordGroup label="Outils"                 items={keywordAnalysis.tools}            color="orange" />
                <KeywordGroup label="Langues"                items={keywordAnalysis.languages}        color="green"  />
                <KeywordGroup label="Incontournables"        items={keywordAnalysis.mustHave}         color="red"    />
                <KeywordGroup label="Appréciés"              items={keywordAnalysis.niceToHave}       color="gray"   />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}