// app/page.tsx
'use client';

import Link from 'next/link';
import { useCVStore } from '@/lib/store';
import { FileText, Sparkles, Upload, User, MessageSquare, CheckCircle, Circle, ArrowRight, Zap, Target, Shield, PenLine } from 'lucide-react';

export default function HomePage() {
  const { profile, jobDescription, generatedCV } = useCVStore();

  const hasProfile = !!profile?.fullName;
  const hasJob = !!jobDescription?.trim();
  const hasCV = !!generatedCV;

  const steps = [
    {
      num: '01',
      icon: User,
      title: 'Créer mon profil',
      desc: 'Renseigne tes expériences, compétences et formations une seule fois.',
      href: '/dashboard/profile',
      done: hasProfile,
      cta: hasProfile ? 'Modifier le profil' : 'Commencer mon profil',
    },
    {
      num: '02',
      icon: Upload,
      title: "Coller une offre d'emploi",
      desc: "Colle la description de l'annonce. L'IA extrait les mots-clés ATS automatiquement.",
      href: '/dashboard/job',
      done: hasJob,
      cta: hasJob ? "Changer l'offre" : "Ajouter une offre",
    },
    {
      num: '03',
      icon: Sparkles,
      title: 'Générer le CV adapté',
      desc: "Gemini réécrit tes expériences pour maximiser le matching avec le poste.",
      href: '/dashboard/generate',
      done: hasCV,
      cta: hasCV ? 'Voir mon CV' : 'Générer mon CV',
      highlight: true,
    },
  ];

  const completedSteps = [hasProfile, hasJob, hasCV].filter(Boolean).length;
  const progressPct = Math.round((completedSteps / 3) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
            <Zap className="w-3 h-3" />
            Propulsé par Google Gemini — 100% gratuit
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
            Ton CV, <span className="text-primary">adapté à chaque offre</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Colle une annonce, l'IA réécrit ton CV avec les bons mots-clés ATS.
            3 templates professionnels. Export PDF en un clic.
          </p>

          {/* Progress bar si l'utilisateur a déjà commencé */}
          {completedSteps > 0 && (
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progression</span>
                <span>{completedSteps}/3 étapes complétées</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`relative rounded-2xl border p-6 transition-all hover:shadow-lg ${
                step.highlight && !step.done
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : step.done
                  ? 'border-green-200 bg-green-50/50 dark:bg-green-950/30 dark:border-green-800'
                  : 'border-border bg-white dark:bg-slate-900 hover:border-primary/40'
              }`}
            >
              {/* Badge step */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-muted-foreground/50">
                  {step.num}
                </span>
                {step.done ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </div>

              <step.icon className={`w-9 h-9 mb-3 ${step.done ? 'text-green-500' : 'text-primary'}`} />

              <h3 className="font-bold text-base mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.desc}</p>

              <Link
                href={step.href}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  step.done
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400'
                    : step.highlight
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {step.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-6 mb-14">
          {[
            {
              icon: Target,
              title: 'Optimisé ATS',
              desc: "Les mots-clés de l'offre sont intégrés naturellement dans ton CV pour passer les filtres automatiques.",
            },
            {
              icon: Sparkles,
              title: 'Réécriture IA',
              desc: "Tes expériences sont reformulées en mode \"action + résultat\" pour maximiser l'impact.",
            },
            {
              icon: Shield,
              title: '+5 Templates PDF',
              desc: 'Classique, Moderne ou Minimaliste. Choisis ton style et exporte en PDF en un clic.',
            },
            {
              icon: PenLine,
              title: 'Lettre de motivation',
              desc: 'Une lettre de motivation conçue pour ton poste cible, exportable en PDF en un clic.',
            },
          ].map((f, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-border">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Assistant IA disponible</p>
              <p className="text-sm text-muted-foreground">
                Pose des questions sur ton CV, demande des conseils, prépare ton entretien.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/chat"
            className="shrink-0 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ouvrir le chat
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}