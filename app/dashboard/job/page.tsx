// app/dashboard/job/page.tsx
'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sparkles, Loader2, Briefcase, Tags, Link2, ExternalLink, Save,
  ChevronDown, ChevronUp, ClipboardList, Download, BookOpen,
  CheckCircle, Clock, Code2, Heart, Star, RotateCcw, Trophy,
  XCircle, ChevronRight, ChevronLeft, ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';
import AIProviderSelector from '@/app/components/AIProviderSelector';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TestQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  durationMin?: number;
}

interface TestSection {
  label: string;
  color: string;
  icon: string;
  questions: TestQuestion[];
}

interface JobTest {
  title: string;
  poste: string;
  date: string;
  totalQuestions: number;
  estimatedMinutes: number;
  sections: TestSection[];
}

// Flat list of all questions with section metadata
interface FlatQuestion extends TestQuestion {
  sectionLabel: string;
  sectionColor: string;
  sectionIcon: string;   // ← ajouter
  globalIndex: number;
}

// ─── Color map ────────────────────────────────────────────────────────────────

const colorMap: Record<string, { pill: string; dot: string; label: string; header: string; ring: string }> = {
  blue:   { pill: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',         dot: 'bg-blue-500',         label: 'text-blue-600 dark:text-blue-400',     header: 'bg-blue-500/5 border-blue-500/20',   ring: 'ring-blue-500'   },
  purple: { pill: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20', dot: 'bg-violet-500',       label: 'text-violet-600 dark:text-violet-400', header: 'bg-violet-500/5 border-violet-500/20', ring: 'ring-violet-500' },
  orange: { pill: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20', dot: 'bg-orange-500',       label: 'text-orange-600 dark:text-orange-400', header: 'bg-orange-500/5 border-orange-500/20', ring: 'ring-orange-500' },
  green:  { pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500', label: 'text-emerald-600 dark:text-emerald-400', header: 'bg-emerald-500/5 border-emerald-500/20', ring: 'ring-emerald-500' },
  red:    { pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',         dot: 'bg-rose-500',         label: 'text-rose-600 dark:text-rose-400',     header: 'bg-rose-500/5 border-rose-500/20',   ring: 'ring-rose-500'   },
  gray:   { pill: 'bg-muted text-muted-foreground border border-border',                               dot: 'bg-muted-foreground', label: 'text-muted-foreground',               header: 'bg-muted border-border',             ring: 'ring-border'     },
};

const sectionIconMap: Record<string, React.ElementType> = {
  code: Code2, heart: Heart, star: Star, book: BookOpen,
};

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── QCM Player ───────────────────────────────────────────────────────────────

function QCMPlayer({ test, onRestart }: { test: JobTest; onRestart: () => void }) {
  // Flatten all questions
  const allQuestions: FlatQuestion[] = test.sections.flatMap((section, si) =>
  section.questions.map((q, qi) => ({
    ...q,
    sectionLabel: section.label,
    sectionColor: section.color,
    sectionIcon: section.icon,   // ← ajouter
    globalIndex: si * 100 + qi,
  }))
);

  const [current, setCurrent]       = useState(0);
  const [answers, setAnswers]       = useState<(number | null)[]>(Array(allQuestions.length).fill(null));
  const [revealed, setRevealed]     = useState<boolean[]>(Array(allQuestions.length).fill(false));
  const [finished, setFinished]     = useState(false);

  const q = allQuestions[current];
  const c = colorMap[q.sectionColor] ?? colorMap.gray;
  const SectionIcon = sectionIconMap[q.sectionIcon ?? 'book'] ?? BookOpen;

  const selectedAnswer   = answers[current];
  const isRevealed       = revealed[current];
  const isCorrect        = selectedAnswer === q.correctIndex;

  const score = answers.filter((a, i) => a === allQuestions[i].correctIndex).length;
  const answeredCount = answers.filter(a => a !== null).length;

  function handleChoose(idx: number) {
    if (isRevealed) return;
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    const nextR = [...revealed];
    nextR[current] = true;
    setRevealed(nextR);
  }

  function handleNext() {
    if (current < allQuestions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setFinished(true);
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(c => c - 1);
  }

  function handleRestart() {
    setCurrent(0);
    setAnswers(Array(allQuestions.length).fill(null));
    setRevealed(Array(allQuestions.length).fill(false));
    setFinished(false);
  }

  // ── Score screen ──
  if (finished) {
    const pct = Math.round((score / allQuestions.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪';
    const mention = pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : 'À retravailler';
    const missedQuestions = allQuestions.filter((_, i) => answers[i] !== allQuestions[i].correctIndex);

    return (
      <div className="space-y-4">
        {/* Score card */}
        <div className="rounded-2xl border border-violet-500/20 bg-card p-6 text-center space-y-3">
          <div className="text-4xl">{emoji}</div>
          <h3 className="text-xl font-bold">{mention}</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-primary">{score}</span>
            <span className="text-xl text-muted-foreground">/ {allQuestions.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{pct}% de bonnes réponses</p>
        </div>

        {/* Missed questions recap */}
        {missedQuestions.length > 0 && (
          <div className="rounded-2xl border border-rose-500/20 bg-card overflow-hidden">
            <div className="px-5 py-3 bg-rose-500/5 border-b border-rose-500/20 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                {missedQuestions.length} question{missedQuestions.length > 1 ? 's' : ''} à revoir
              </p>
            </div>
            <div className="divide-y divide-border">
              {missedQuestions.map((mq, i) => {
                const globalIdx = allQuestions.indexOf(mq);
                const userAnswerIdx = answers[globalIdx];
                const mc = colorMap[mq.sectionColor] ?? colorMap.gray;
                return (
                  <div key={i} className="px-5 py-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${mc.pill}`}>
                        {mq.sectionLabel}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{mq.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {mq.choices.map((ch, ci) => {
                        const isRight = ci === mq.correctIndex;
                        const isUser  = ci === userAnswerIdx;
                        return (
                          <div
                            key={ci}
                            className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
                              isRight ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
                              isUser  ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300' :
                              'bg-muted/40 border-border text-muted-foreground'
                            }`}
                          >
                            <span className="font-bold shrink-0">{CHOICE_LABELS[ci]}.</span>
                            {ch}
                            {isRight && <CheckCircle className="w-3 h-3 ml-auto shrink-0" />}
                            {isUser && !isRight && <XCircle className="w-3 h-3 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                    {mq.explanation && (
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        💡 {mq.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold border border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Recommencer le test
          </button>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold border border-border bg-background hover:bg-muted transition-all"
          >
            <Sparkles className="w-4 h-4" /> Regénérer
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ──
  const progressPct = ((current + 1) / allQuestions.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar + nav */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={`font-semibold ${c.label}`}>{q.sectionLabel}</span>
          <span>{current + 1} / {allQuestions.length}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Answer status dots */}
        <div className="flex gap-1 flex-wrap">
          {allQuestions.map((_, i) => {
            const ans = answers[i];
            const correct = ans === allQuestions[i].correctIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                  i === current
                    ? 'ring-2 ring-primary ring-offset-1 bg-primary text-primary-foreground'
                    : ans === null
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : correct
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <div className={`rounded-2xl border ${c.header} p-5 space-y-5`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl ${c.header} border flex items-center justify-center shrink-0`}>
            <span className={`text-xs font-black ${c.label}`}>Q{current + 1}</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed pt-1">{q.question}</p>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {q.choices.map((choice, ci) => {
            const isSelected = selectedAnswer === ci;
            const isCorrectChoice = ci === q.correctIndex;
            let choiceStyle = 'border-border bg-background/60 hover:bg-muted/40 hover:border-border/80';

            if (isRevealed) {
              if (isCorrectChoice) {
                choiceStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
              } else if (isSelected && !isCorrectChoice) {
                choiceStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300';
              } else {
                choiceStyle = 'border-border/50 bg-muted/30 text-muted-foreground';
              }
            }

            return (
              <button
                key={ci}
                onClick={() => handleChoose(ci)}
                disabled={isRevealed}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${choiceStyle} disabled:cursor-default`}
              >
                <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isRevealed && isCorrectChoice ? 'border-emerald-500 bg-emerald-500 text-white' :
                  isRevealed && isSelected ? 'border-rose-500 bg-rose-500 text-white' :
                  'border-border'
                }`}>
                  {isRevealed && isCorrectChoice ? <CheckCircle className="w-3 h-3" /> :
                   isRevealed && isSelected ? <XCircle className="w-3 h-3" /> :
                   CHOICE_LABELS[ci]}
                </span>
                <span className="flex-1 leading-relaxed">{choice}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isRevealed && q.explanation && (
          <div className={`flex items-start gap-2 px-4 py-3 rounded-xl ${isCorrect ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-amber-500/5 border border-amber-500/20'}`}>
            <span className="text-base shrink-0">{isCorrect ? '✅' : '💡'}</span>
            <p className="text-xs leading-relaxed text-muted-foreground">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Précédent
        </button>

        <span className="text-xs text-muted-foreground">
          {answeredCount}/{allQuestions.length} répondu{answeredCount > 1 ? 's' : ''}
        </span>

        {current < allQuestions.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-semibold border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all"
          >
            Suivant <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 h-9 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-500/20 transition-all"
          >
            <Trophy className="w-3.5 h-3.5" /> Voir mes résultats
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Download helpers ─────────────────────────────────────────────────────────

function downloadJSON(test: JobTest) {
  const blob = new Blob([JSON.stringify(test, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-qcm-${test.poste.toLowerCase().replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTXT(test: JobTest) {
  const lines: string[] = [
    `TEST QCM — ${test.poste.toUpperCase()}`,
    `Généré le ${test.date}`,
    `${test.totalQuestions} questions • ~${test.estimatedMinutes} min`,
    '',
    '═'.repeat(60),
    '',
  ];
  test.sections.forEach(section => {
    lines.push(`▶ ${section.label.toUpperCase()}`);
    lines.push('─'.repeat(40));
    section.questions.forEach((q, i) => {
      lines.push(`${i + 1}. ${q.question}`);
      q.choices?.forEach((ch, ci) => {
        lines.push(`   ${['A', 'B', 'C', 'D'][ci]}. ${ch}${ci === q.correctIndex ? '  ✓' : ''}`);
      });
      if (q.explanation) lines.push(`   💡 ${q.explanation}`);
      lines.push('');
    });
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-qcm-${test.poste.toLowerCase().replace(/\s+/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function JobPage() {
  const {
    jobDescription, setJobDescription,
    keywordAnalysis, setKeywordAnalysis,
    aiProvider, aiModel,
    jobUrl, setJobUrl,
  } = useCVStore();

  const [loading, setLoading]           = useState(false);
  const [localJob, setLocalJob]         = useState(jobDescription);
  const [saved, setSaved]               = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(true);

  // ── Test state ──
  const [jobTest, setJobTest]           = useState<JobTest | null>(null);
  const [testLoading, setTestLoading]   = useState(false);
  const [testSaved, setTestSaved]       = useState(false);
  const [testOpen, setTestOpen]         = useState(true);
  // QCM mode: 'player' = in progress/finished, 'overview' = read-only list
  const [qcmMode, setQcmMode]           = useState<'player' | 'overview'>('player');
  // Key to force QCMPlayer remount on restart
  const [qcmKey, setQcmKey]            = useState(0);

  // ── Handlers ──

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
      setJobTest(null);
      setTestSaved(false);
      toast.success('Offre analysée avec succès !');
    } catch (err: any) {
      toast.error("Erreur lors de l'analyse", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTest = async () => {
    if (!keywordAnalysis) return;
    setTestLoading(true);
    try {
      const res = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: localJob,
          keywordAnalysis,
          provider: aiProvider,
          model: aiModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de génération');
      setJobTest(data.test);
      setQcmMode('player');
      setQcmKey(k => k + 1);
      setTestOpen(true);
      toast.success('Test QCM généré !', { description: `${data.test.totalQuestions} questions prêtes.` });
    } catch (err: any) {
      toast.error('Erreur lors de la génération du test', { description: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveTest = () => {
    if (!jobTest) return;
    try {
      localStorage.setItem('cv-generator-saved-test', JSON.stringify(jobTest));
      setTestSaved(true);
      toast.success('Test sauvegardé !', { description: 'Disponible dans Mes tests si retenu(e).' });
    } catch {
      toast.error('Impossible de sauvegarder le test localement.');
    }
  };

  // Load saved test from history (localStorage) into player
  const handleLoadSavedTest = () => {
    try {
      const raw = localStorage.getItem('cv-generator-saved-test');
      if (!raw) { toast.error('Aucun test sauvegardé.'); return; }
      const test: JobTest = JSON.parse(raw);
      setJobTest(test);
      setQcmMode('player');
      setQcmKey(k => k + 1);
      setTestOpen(true);
      toast.success('Test chargé — bonne chance !');
    } catch {
      toast.error('Impossible de charger le test sauvegardé.');
    }
  };

  const totalKeywords = keywordAnalysis
    ? [keywordAnalysis.technicalSkills, keywordAnalysis.softSkills, keywordAnalysis.tools, keywordAnalysis.languages, keywordAnalysis.mustHave, keywordAnalysis.niceToHave].flat().length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* ── Hero header ── */}
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
              <p className="text-sm text-muted-foreground mt-1">
                Collez l'annonce ou son lien — l'IA en extrait les mots-clés ATS pour adapter votre CV.
              </p>
            </div>
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

        {/* ── Input Card ── */}
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
                <Input
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={e => setJobUrl(e.target.value)}
                  type="url"
                  className="h-9 text-sm"
                />
                {jobUrl && (
                  <a
                    href={jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3 flex items-center gap-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Voir
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Si vous renseignez le lien, la description peut rester vide.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Description complète de l'offre
              </Label>
              <Textarea
                placeholder="Collez ici l'intégralité de l'annonce (missions, exigences, compétences...)"
                className="min-h-[220px] resize-y text-sm"
                value={localJob}
                onChange={e => setLocalJob(e.target.value)}
              />
              {localJob && (
                <p className="text-xs text-muted-foreground text-right">
                  {localJob.split(' ').filter(Boolean).length} mots
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!localJob.trim() && !jobUrl}
                className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  saved
                    ? 'bg-emerald-500 text-white border-transparent'
                    : 'border-border bg-background hover:bg-muted text-foreground'
                }`}
              >
                <Save className="w-4 h-4" /> {saved ? 'Enregistré !' : 'Enregistrer'}
              </button>
              <button
                onClick={handleAnalyze}
                disabled={(!localJob.trim() && !jobUrl) || loading}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse...</>
                  : <><Sparkles className="w-4 h-4" /> Analyser avec l'IA</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Résultats mots-clés ── */}
        {keywordAnalysis && (
          <div className="rounded-2xl border border-emerald-500/20 bg-card shadow-sm overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-muted/30 transition-colors"
              onClick={() => setAnalysisOpen(v => !v)}
            >
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

        {/* ── Zone de test — CTA de génération ── */}
        {keywordAnalysis && !jobTest && (
          <div className="rounded-2xl border border-violet-500/20 bg-card shadow-sm overflow-hidden">
            <div className="relative p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-primary/5 pointer-events-none rounded-2xl" />
              <div className="relative flex flex-col sm:flex-row items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <ListChecks className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm">Test QCM personnalisé</p>
                      <span className="text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                        Nouveau
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      4 choix par question, correction immédiate et score final.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={handleGenerateTest}
                    disabled={testLoading}
                    className="flex items-center justify-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {testLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</>
                      : <><Sparkles className="w-4 h-4" /> Générer le QCM</>}
                  </button>
                  <button
                    onClick={handleLoadSavedTest}
                    className="flex items-center justify-center gap-2 px-5 h-9 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-violet-500" /> Reprendre le test sauvegardé
                  </button>
                </div>
              </div>

              <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: Code2,      label: 'Technique',   color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
                  { icon: Heart,      label: 'Soft skills', color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
                  { icon: Star,       label: 'Situationnel',color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
                  { icon: BookOpen,   label: 'Motivation',  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5">
                    <div className={`w-6 h-6 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                      <cat.icon className={`w-3 h-3 ${cat.color}`} />
                    </div>
                    <p className="text-xs font-medium truncate">{cat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Zone de test — QCM Player ── */}
        {jobTest && (
          <div className="rounded-2xl border border-violet-500/20 bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-muted/30 transition-colors"
              onClick={() => setTestOpen(v => !v)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <ListChecks className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">{jobTest.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {jobTest.totalQuestions} questions · ~{jobTest.estimatedMinutes} min
                  </p>
                </div>
              </div>
              {testOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>

            {testOpen && (
              <div className="border-t border-border/50">
                {/* Action bar */}
                <div className="px-6 py-3 flex items-center flex-wrap gap-2 bg-muted/20 border-b border-border/40">
                  <button
                    onClick={() => { setQcmKey(k => k + 1); setQcmMode('player'); }}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-all"
                  >
                    <RotateCcw className="w-3 h-3 text-violet-500" /> Recommencer
                  </button>
                  <button
                    onClick={handleGenerateTest}
                    disabled={testLoading}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-all disabled:opacity-40"
                  >
                    {testLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-violet-500" />}
                    Regénérer
                  </button>
                  <button
                    onClick={() => downloadJSON(jobTest)}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-all"
                  >
                    <Download className="w-3 h-3 text-primary" /> .json
                  </button>
                  <button
                    onClick={() => downloadTXT(jobTest)}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-all"
                  >
                    <Download className="w-3 h-3 text-amber-500" /> .txt
                  </button>
                  <button
                    onClick={handleSaveTest}
                    disabled={testSaved}
                    className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-all ml-auto ${
                      testSaved
                        ? 'bg-emerald-500 text-white border-transparent'
                        : 'border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'
                    }`}
                  >
                    {testSaved
                      ? <><CheckCircle className="w-3 h-3" /> Sauvegardé</>
                      : <><Save className="w-3 h-3" /> Sauvegarder</>}
                  </button>
                </div>

                {/* QCM player */}
                <div className="px-6 pb-6 pt-5">
                  <QCMPlayer
                    key={qcmKey}
                    test={jobTest}
                    onRestart={handleGenerateTest}
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}