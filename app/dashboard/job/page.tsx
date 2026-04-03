// app/dashboard/job/page.tsx
'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Briefcase, Tags } from 'lucide-react';
import { toast } from 'sonner';
import AIProviderSelector from '@/app/components/AIProviderSelector';

export default function JobPage() {
  const {
    jobDescription,
    setJobDescription,
    keywordAnalysis,
    setKeywordAnalysis,
    aiProvider,
    aiModel,
  } = useCVStore();

  const [loading, setLoading] = useState(false);
  const [localJob, setLocalJob] = useState(jobDescription);

  const handleSave = () => {
    setJobDescription(localJob);
    toast.success('Offre enregistrée !');
  };

  const handleAnalyze = async () => {
    if (!localJob.trim()) return;
    setJobDescription(localJob);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: localJob,
          provider: aiProvider,
          model: aiModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'analyse");
      setKeywordAnalysis(data.analysis);
      toast.success('Offre analysée !', { description: 'Les mots-clés ont été extraits.' });
    } catch (err: any) {
      toast.error("Erreur lors de l'analyse", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Offre d'emploi cible</h1>
          <p className="text-muted-foreground">
            Collez l'offre ici. L'IA va en extraire les mots-clés ATS pour adapter votre CV.
          </p>
        </div>
        {/* Même sélecteur que sur la page génération */}
        <AIProviderSelector />
      </div>

      {/* Textarea */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="w-5 h-5 text-primary" /> Description du poste
          </CardTitle>
          <CardDescription>Copiez-collez l'intégralité de l'annonce.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Collez l'offre d'emploi ici..."
            className="min-h-[240px] resize-y"
            value={localJob}
            onChange={(e) => setLocalJob(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={!localJob.trim()}>
              Enregistrer
            </Button>
            <Button onClick={handleAnalyze} disabled={!localJob.trim() || loading} className="flex-1">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyse en cours...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Analyser avec l'IA</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats d'analyse */}
      {keywordAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags className="w-5 h-5 text-primary" /> Mots-clés extraits
            </CardTitle>
            <CardDescription>{keywordAnalysis.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <KeywordGroup label="Compétences techniques" items={keywordAnalysis.technicalSkills} color="blue" />
            <KeywordGroup label="Soft skills" items={keywordAnalysis.softSkills} color="purple" />
            <KeywordGroup label="Outils" items={keywordAnalysis.tools} color="orange" />
            <KeywordGroup label="Langues" items={keywordAnalysis.languages} color="green" />
            <KeywordGroup label="Incontournables" items={keywordAnalysis.mustHave} color="red" />
            <KeywordGroup label="Appréciés" items={keywordAnalysis.niceToHave} color="gray" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function KeywordGroup({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`text-xs px-2 py-1 rounded-full font-medium ${colorMap[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}