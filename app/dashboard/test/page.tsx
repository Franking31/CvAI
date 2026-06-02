'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCVStore } from '@/lib/store';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { parseApiError } from '@/lib/errors';
import {
  ClipboardList,
  History,
  ChevronDown,
  ChevronUp,
  Timer,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Trash2,
  Play,
  RotateCcw,
  Loader2,
  AlertCircle,
  Code,
  Heart,
  Star,
  BookOpen,
  Cloud,
  CloudOff,
  Trophy,
  Clock,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

// Question QCM — 4 choix, 1 bonne réponse
type Question = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  durationMin: number;
};

type Section = {
  label: string;
  color: 'blue' | 'purple' | 'orange' | 'green';
  icon: 'code' | 'heart' | 'star' | 'book';
  questions: Question[];
};

type InterviewTest = {
  title: string;
  poste: string;
  date: string;
  totalQuestions: number;
  estimatedMinutes: number;
  sections: Section[];
};

type SavedTest = {
  id: string;
  created_at: string;
  test_data: InterviewTest;
  score?: number;
  completed?: boolean;
};

// Question aplatie avec métadonnées de section (pour le QCM player)
type FlatQuestion = Question & {
  sectionLabel: string;
  sectionColor: 'blue' | 'purple' | 'orange' | 'green';
  sectionIcon: 'code' | 'heart' | 'star' | 'book';
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

const ICON_MAP = {
  code: Code,
  heart: Heart,
  star: Star,
  book: BookOpen,
};

const COLOR_MAP = {
  blue: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
    ring: 'ring-blue-200 dark:ring-blue-800',
    header: 'from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    progress: 'bg-blue-500',
    section: 'bg-blue-500/5 border-blue-500/20',
    label: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    dot: 'bg-purple-500',
    ring: 'ring-purple-200 dark:ring-purple-800',
    header: 'from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    progress: 'bg-purple-500',
    section: 'bg-purple-500/5 border-purple-500/20',
    label: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    dot: 'bg-orange-500',
    ring: 'ring-orange-200 dark:ring-orange-800',
    header: 'from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    progress: 'bg-orange-500',
    section: 'bg-orange-500/5 border-orange-500/20',
    label: 'text-orange-600 dark:text-orange-400',
  },
  green: {
    badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    dot: 'bg-green-500',
    ring: 'ring-green-200 dark:ring-green-800',
    header: 'from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    progress: 'bg-green-500',
    section: 'bg-green-500/5 border-green-500/20',
    label: 'text-green-600 dark:text-green-400',
  },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Timer par question ───────────────────────────────────────────────────────

function QuestionTimer({ durationMin, running }: { durationMin: number; running: boolean }) {
  const total = durationMin * 60;
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && elapsed < total) {
      ref.current = setInterval(() => setElapsed((e) => Math.min(e + 1, total)), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, elapsed, total]);

  const pct = (elapsed / total) * 100;
  const warn = pct > 80;

  return (
    <div className={cn('flex items-center gap-1 text-xs tabular-nums', warn ? 'text-red-500' : 'text-muted-foreground')}>
      <Timer className="w-3 h-3" />
      {formatTime(elapsed)}
    </div>
  );
}

// ─── QCM Player ───────────────────────────────────────────────────────────────

function QCMPlayer({
  test,
  onRestart,
  onNewTest,
  onSaveScore,
}: {
  test: InterviewTest;
  onRestart: () => void;
  onNewTest: () => void;
  onSaveScore?: (score: number, completed: boolean) => void;
}) {
  // Aplatir toutes les questions
  const allQuestions: FlatQuestion[] = test.sections.flatMap((section) =>
    section.questions.map((q) => ({
      ...q,
      sectionLabel: section.label,
      sectionColor: section.color,
      sectionIcon: section.icon,
    }))
  );

  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<(number | null)[]>(Array(allQuestions.length).fill(null));
  const [revealed, setRevealed] = useState<boolean[]>(Array(allQuestions.length).fill(false));
  const [finished, setFinished] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  const q = allQuestions[current];
  const colors = COLOR_MAP[q.sectionColor];
  const SectionIcon = ICON_MAP[q.sectionIcon];

  const selectedAnswer = answers[current];
  const isRevealed     = revealed[current];
  const isCorrect      = selectedAnswer === q.correctIndex;

  const score        = answers.filter((a, i) => a === allQuestions[i].correctIndex).length;
  const answeredCount = answers.filter((a) => a !== null).length;

  function choose(idx: number) {
    if (isRevealed) return;
    setAnswers((prev) => { const n = [...prev]; n[current] = idx; return n; });
    setRevealed((prev) => { const n = [...prev]; n[current] = true; return n; });
  }

  function goNext() {
    if (current < allQuestions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
      if (onSaveScore && !scoreSaved) {
        const pct = Math.round((score / allQuestions.length) * 100);
        onSaveScore(pct, answeredCount === allQuestions.length);
        setScoreSaved(true);
      }
    }
  }

  function restart() {
    setCurrent(0);
    setAnswers(Array(allQuestions.length).fill(null));
    setRevealed(Array(allQuestions.length).fill(false));
    setFinished(false);
    setScoreSaved(false);
  }

  // ── Écran résultats ──
  if (finished) {
    const pct = Math.round((score / allQuestions.length) * 100);
    const emoji   = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪';
    const mention = pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : 'À retravailler';
    const missed  = allQuestions.filter((_, i) => answers[i] !== allQuestions[i].correctIndex);

    return (
      <div className="space-y-4">
        {/* Score */}
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center space-y-3">
          <div className="text-4xl">{emoji}</div>
          <h3 className="text-xl font-bold">{mention}</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-primary">{score}</span>
            <span className="text-xl text-muted-foreground">/ {allQuestions.length}</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all duration-700',
                pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{pct}% de bonnes réponses</p>
        </div>

        {/* Questions ratées */}
        {missed.length > 0 && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900 overflow-hidden">
            <div className="px-5 py-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {missed.length} question{missed.length > 1 ? 's' : ''} à revoir
              </p>
            </div>
            <div className="divide-y divide-border">
              {missed.map((mq, i) => {
                const globalIdx   = allQuestions.indexOf(mq);
                const userIdx     = answers[globalIdx];
                const mc          = COLOR_MAP[mq.sectionColor];
                return (
                  <div key={i} className="px-5 py-4 space-y-2">
                    <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', mc.badge)}>
                      {mq.sectionLabel}
                    </span>
                    <p className="text-sm font-medium">{mq.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {mq.choices.map((ch, ci) => {
                        const isRight = ci === mq.correctIndex;
                        const isUser  = ci === userIdx;
                        return (
                          <div
                            key={ci}
                            className={cn(
                              'text-xs px-3 py-2 rounded-lg border flex items-center gap-2',
                              isRight ? 'bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-800 text-green-700 dark:text-green-300' :
                              isUser  ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300' :
                              'bg-muted/40 border-border text-muted-foreground'
                            )}
                          >
                            <span className="font-bold shrink-0">{CHOICE_LABELS[ci]}.</span>
                            <span className="flex-1">{ch}</span>
                            {isRight && <CheckCircle className="w-3 h-3 shrink-0" />}
                            {isUser && !isRight && <XCircle className="w-3 h-3 shrink-0" />}
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
          <Button variant="outline" onClick={restart} className="flex-1 gap-2">
            <RotateCcw className="w-4 h-4" /> Recommencer le test
          </Button>
          <Button variant="outline" onClick={onNewTest} className="gap-2">
            <Play className="w-4 h-4" /> Nouveau test
          </Button>
        </div>
      </div>
    );
  }

  // ── Écran question ──
  const progressPct = ((current + 1) / allQuestions.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progression + dots */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={cn('font-semibold', colors.label)}>{q.sectionLabel}</span>
          <span>{current + 1} / {allQuestions.length}</span>
        </div>
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Dots de navigation */}
        <div className="flex gap-1 flex-wrap">
          {allQuestions.map((_, i) => {
            const ans     = answers[i];
            const correct = ans === allQuestions[i].correctIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-all',
                  i === current
                    ? 'ring-2 ring-primary ring-offset-1 bg-primary text-primary-foreground'
                    : ans === null
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : correct
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Carte question */}
      <div className={cn('rounded-2xl border p-5 space-y-5', colors.section)}>
        <div className="flex items-start gap-3">
          <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', colors.section)}>
            <span className={cn('text-xs font-black', colors.label)}>Q{current + 1}</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed pt-1">{q.question}</p>
        </div>

        {/* Choix */}
        <div className="space-y-2">
          {q.choices.map((choice, ci) => {
            const isSelected      = selectedAnswer === ci;
            const isCorrectChoice = ci === q.correctIndex;

            let style = 'border-border bg-background/60 hover:bg-muted/40 hover:border-border/80 cursor-pointer';
            if (isRevealed) {
              if (isCorrectChoice)           style = 'border-green-400 dark:border-green-700 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 cursor-default';
              else if (isSelected)           style = 'border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 cursor-default';
              else                           style = 'border-border/50 bg-muted/30 text-muted-foreground cursor-default';
            }

            return (
              <button
                key={ci}
                onClick={() => choose(ci)}
                disabled={isRevealed}
                className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all disabled:cursor-default', style)}
              >
                <span className={cn(
                  'w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0',
                  isRevealed && isCorrectChoice ? 'border-green-500 bg-green-500 text-white' :
                  isRevealed && isSelected      ? 'border-red-500 bg-red-500 text-white' :
                  'border-border'
                )}>
                  {isRevealed && isCorrectChoice ? <CheckCircle className="w-3 h-3" /> :
                   isRevealed && isSelected      ? <XCircle className="w-3 h-3" /> :
                   CHOICE_LABELS[ci]}
                </span>
                <span className="flex-1 leading-relaxed">{choice}</span>
              </button>
            );
          })}
        </div>

        {/* Explication */}
        {isRevealed && q.explanation && (
          <div className={cn(
            'flex items-start gap-2 px-4 py-3 rounded-xl border text-xs leading-relaxed',
            isCorrect
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          )}>
            <span className="text-base shrink-0">{isCorrect ? '✅' : '💡'}</span>
            <p>{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0} className="gap-1.5">
          <ChevronLeft className="w-3.5 h-3.5" /> Précédent
        </Button>
        <span className="text-xs text-muted-foreground">
          {answeredCount}/{allQuestions.length} répondu{answeredCount > 1 ? 's' : ''}
        </span>
        {current < allQuestions.length - 1 ? (
          <Button variant="outline" size="sm" onClick={goNext} className="gap-1.5">
            Suivant <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={goNext} className="gap-1.5 bg-violet-600 hover:bg-violet-500">
            <Trophy className="w-3.5 h-3.5" /> Voir mes résultats
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Onglet Test Actif ────────────────────────────────────────────────────────

function TestTab() {
  const { keywordAnalysis, jobDescription, aiProvider, aiModel } = useCVStore();
  const { user } = useAuth();
  const supabase = createClient();

  const [test, setTest]     = useState<InterviewTest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [saved, setSaved]   = useState(false);
  // clé pour forcer le remount du QCMPlayer à chaque recommencement
  const [playerKey, setPlayerKey] = useState(0);

  const generateTest = useCallback(async () => {
    if (!keywordAnalysis) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, keywordAnalysis, provider: aiProvider, model: aiModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur interne');
      setTest(data.test);
      setPlayerKey((k) => k + 1);
    } catch (e: any) {
      setError(parseApiError(e.message, aiProvider));
    } finally {
      setLoading(false);
    }
  }, [keywordAnalysis, jobDescription, aiProvider, aiModel]);

  const saveScore = async (score: number, completed: boolean) => {
    if (!user || !test) return;
    const { error } = await supabase.from('interview_tests').insert({
      user_id: user.id,
      test_data: test,
      score,
      completed,
    });
    if (!error) setSaved(true);
  };

  // ── Pas d'analyse ──
  if (!keywordAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <FileQuestion className="w-12 h-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium text-muted-foreground">Aucune analyse disponible</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Rends-toi d'abord sur la page <strong>Offre</strong> pour analyser une description de poste.
          </p>
        </div>
      </div>
    );
  }

  // ── CTA génération ──
  if (!test && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ListChecks className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold">Prêt pour l'entretien ?</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Génère un test QCM personnalisé basé sur l'analyse de l'offre et entraîne-toi avant ton entretien.
          </p>
        </div>
        <Button onClick={generateTest} size="lg" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Générer mon test QCM
        </Button>
        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 max-w-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Génération du QCM en cours…</p>
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="space-y-6">
      {/* Header du test */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-bold text-lg">{test.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileQuestion className="w-3.5 h-3.5" />
                {test.totalQuestions} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{test.estimatedMinutes} min
              </span>
              <Badge variant="outline" className="text-xs">{test.date}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setPlayerKey((k) => k + 1)} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Recommencer
            </Button>
            <Button variant="outline" size="sm" onClick={generateTest} className="gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Nouveau test
            </Button>
            {user && saved && (
              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sauvegardé
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* QCM Player */}
      <QCMPlayer
        key={playerKey}
        test={test}
        onRestart={() => setPlayerKey((k) => k + 1)}
        onNewTest={generateTest}
        onSaveScore={user ? saveScore : undefined}
      />
    </div>
  );
}

// ─── Onglet Historique ────────────────────────────────────────────────────────

function HistoryTab() {
  const { user } = useAuth();
  const supabase = createClient();
  const [tests, setTests]     = useState<SavedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  // Test chargé depuis l'historique pour le rejouer
  const [replayTest, setReplayTest] = useState<InterviewTest | null>(null);
  const [replayKey, setReplayKey]   = useState(0);

  const loadTests = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('interview_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setTests(data as SavedTest[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { loadTests(); }, [loadTests]);

  const deleteTest = async (id: string) => {
    setDeleting(id);
    await supabase.from('interview_tests').delete().eq('id', id);
    setTests((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  };

  // ── Mode replay ──
  if (replayTest) {
    return (
      <div className="space-y-4">
        {/* Header replay */}
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-lg">{replayTest.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileQuestion className="w-3.5 h-3.5" />
                  {replayTest.totalQuestions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{replayTest.estimatedMinutes} min
                </span>
                <Badge variant="outline" className="text-xs">{replayTest.date}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setReplayKey((k) => k + 1)} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Recommencer
              </Button>
              <Button variant="outline" size="sm" onClick={() => setReplayTest(null)} className="gap-1.5">
                <History className="w-3.5 h-3.5" /> Retour
              </Button>
            </div>
          </div>
        </div>
        <QCMPlayer
          key={replayKey}
          test={replayTest}
          onRestart={() => setReplayKey((k) => k + 1)}
          onNewTest={() => setReplayTest(null)}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <CloudOff className="w-12 h-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium text-muted-foreground">Connexion requise</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Connecte-toi pour accéder à tes tests sauvegardés.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <History className="w-12 h-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium text-muted-foreground">Aucun test sauvegardé</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Génère un test QCM et termine-le pour le retrouver ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((saved) => {
        const t      = saved.test_data;
        const isOpen = expanded === saved.id;
        const date   = new Date(saved.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
        const score = saved.score ?? 0;

        return (
          <div key={saved.id} className="border rounded-2xl overflow-hidden bg-background shadow-sm">
            {/* Ligne résumé */}
            <div className="flex items-center gap-3 px-5 py-4">
              <button
                className="flex-1 flex items-start gap-3 text-left"
                onClick={() => setExpanded(isOpen ? null : saved.id)}
              >
                <div className={cn(
                  'mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  saved.completed ? 'bg-green-100 dark:bg-green-950' : 'bg-muted'
                )}>
                  {saved.completed
                    ? <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                    : <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{date}</span>
                    <span>·</span>
                    <span>{t.totalQuestions} questions</span>
                    <span>·</span>
                    <span>~{t.estimatedMinutes} min</span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                {/* Score */}
                <div className="text-right">
                  <p className={cn(
                    'text-sm font-bold',
                    score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-muted-foreground'
                  )}>
                    {score}%
                  </p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>

                {/* Refaire le test */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => { setReplayTest(t); setReplayKey((k) => k + 1); }}
                  title="Refaire ce test"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Refaire
                </Button>

                {/* Supprimer */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTest(saved.id)}
                  disabled={deleting === saved.id}
                >
                  {deleting === saved.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </Button>

                {/* Expand */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground"
                  onClick={() => setExpanded(isOpen ? null : saved.id)}
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Détail dépliable : aperçu des questions */}
            {isOpen && (
              <div className="border-t bg-muted/30 px-5 py-4 space-y-4">
                {t.sections.map((section, si) => {
                  const colors = COLOR_MAP[section.color];
                  const Icon   = ICON_MAP[section.icon];
                  return (
                    <div key={si}>
                      <div className={cn('flex items-center gap-2 mb-2 text-sm font-semibold', colors.icon)}>
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </div>
                      <ul className="space-y-1.5 pl-6">
                        {section.questions.map((q, qi) => (
                          <li key={qi} className="text-sm text-muted-foreground flex gap-2">
                            <span className="shrink-0 font-mono text-xs mt-0.5">{qi + 1}.</span>
                            <span>{q.question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                <Button
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => { setReplayTest(t); setReplayKey((k) => k + 1); }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Refaire ce test
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page Principale ──────────────────────────────────────────────────────────

// Sparkles inline (non exporté par certaines versions de lucide)
function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}

export default function TestPage() {
  const [tab, setTab] = useState<'test' | 'history'>('test');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Test d'entretien QCM</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Entraîne-toi avec un QCM généré par IA à partir de l'offre analysée.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('test')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'test'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ClipboardList className="w-4 h-4" />
          Nouveau test
        </button>
        <button
          onClick={() => setTab('history')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'history'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <History className="w-4 h-4" />
          Historique
        </button>
      </div>

      {/* Contenu */}
      {tab === 'test' ? <TestTab /> : <HistoryTab />}
    </div>
  );
}