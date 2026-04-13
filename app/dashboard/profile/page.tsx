// app/dashboard/profile/page.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCVStore } from '@/lib/store';
import { userProfileSchema, type UserProfileForm, type UserProfileInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Plus, Trash2, Save, GitBranch, Link2, Globe, ExternalLink,
  AlertCircle, Upload, User, Briefcase, Code2, GraduationCap,
  FolderGit2, Languages, Award, Heart, ChevronDown, ChevronUp,
  Sparkles, CheckCircle2, X,
} from 'lucide-react';
import { toast } from 'sonner';
import CVImport from '@/app/components/CVImport';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RequiredBadge() {
  return <span className="text-rose-400 text-xs font-bold ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-rose-400 text-xs flex items-center gap-1 mt-1.5">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  description,
  badge,
  children,
  accentColor = 'blue',
  collapsible = false,
  defaultOpen = true,
  headerAction,
}: {
  icon: any;
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  accentColor?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'orange';
  collapsible?: boolean;
  defaultOpen?: boolean;
  headerAction?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const colors = {
    blue:    { icon: 'bg-blue-500/10 text-blue-500',     border: 'border-blue-500/20',    dot: 'bg-blue-500'    },
    violet:  { icon: 'bg-violet-500/10 text-violet-500', border: 'border-violet-500/20',  dot: 'bg-violet-500'  },
    emerald: { icon: 'bg-emerald-500/10 text-emerald-500', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    amber:   { icon: 'bg-amber-500/10 text-amber-500',   border: 'border-amber-500/20',   dot: 'bg-amber-500'   },
    rose:    { icon: 'bg-rose-500/10 text-rose-500',     border: 'border-rose-500/20',    dot: 'bg-rose-500'    },
    cyan:    { icon: 'bg-cyan-500/10 text-cyan-500',     border: 'border-cyan-500/20',    dot: 'bg-cyan-500'    },
    orange:  { icon: 'bg-orange-500/10 text-orange-500', border: 'border-orange-500/20',  dot: 'bg-orange-500'  },
  };
  const c = colors[accentColor];

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${c.border}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-6 py-4 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? () => setOpen(v => !v) : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-foreground">{title}</h2>
              {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${c.dot}`}>
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {headerAction && <div onClick={e => e.stopPropagation()}>{headerAction}</div>}
          {collapsible && (
            <span className="text-muted-foreground">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {(!collapsible || open) && (
        <div className="px-6 pb-6 pt-1 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: (p: any) => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Import IA de CV</h3>
              <p className="text-xs text-muted-foreground">PDF, DOCX ou TXT · Max 5 Mo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>L'IA analyse votre CV et remplit automatiquement tout le formulaire. Vérifiez et complétez ensuite.</span>
          </div>
          <CVImport onImported={(importedProfile) => {
            onImported(importedProfile);
            onClose();
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profile, setProfile } = useCVStore();
  const [showImport, setShowImport] = useState(false);
  const [saved, setSaved] = useState(false);

  const form = useForm<UserProfileInput, any, UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: profile ?? {
      fullName: '', title: '', email: '', phone: '', location: '', summary: '',
      github: '', linkedin: '', portfolio: '',
      socialLinks: [],
      experiences: [{ company: '', position: '', dates: '', description: '' }],
      skills: [''],
      education: [{ school: '', degree: '', dates: '' }],
      projects: [], languages: [], certifications: [], interests: [],
    },
  });

  const { fields: expFields,    append: appendExp,    remove: removeExp    } = useFieldArray({ control: form.control, name: 'experiences' });
  const { fields: eduFields,    append: appendEdu,    remove: removeEdu    } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: projFields,   append: appendProj,   remove: removeProj   } = useFieldArray({ control: form.control, name: 'projects' });
  const { fields: langFields,   append: appendLang,   remove: removeLang   } = useFieldArray({ control: form.control, name: 'languages' });
  const { fields: certFields,   append: appendCert,   remove: removeCert   } = useFieldArray({ control: form.control, name: 'certifications' });
  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({ control: form.control, name: 'socialLinks' });

  const onSubmit = (data: UserProfileForm) => {
    setProfile(data);
    setSaved(true);
    toast.success('Profil sauvegardé !');
    setTimeout(() => setSaved(false), 3000);
  };

  const errors = form.formState.errors;

  // Progression
  const watched = form.watch();
  const progressItems = [
    !!watched.fullName, !!watched.title, !!watched.email, !!watched.phone,
    !!watched.location, !!watched.summary,
    (watched.experiences?.length ?? 0) > 0 && !!watched.experiences?.[0]?.company,
    (watched.skills?.filter(Boolean).length ?? 0) >= 3,
    (watched.education?.length ?? 0) > 0 && !!watched.education?.[0]?.school,
  ];
  const progressPct = Math.round((progressItems.filter(Boolean).length / progressItems.length) * 100);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

          {/* ── Hero Header ── */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

            <div className="relative flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Profil</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Mon profil professionnel</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Les champs <span className="text-rose-400 font-semibold">*</span> sont obligatoires pour générer votre CV.
                </p>
              </div>

              {/* Import button */}
              <button
                onClick={() => setShowImport(true)}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Importer mon CV
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">IA</span>
              </button>
            </div>

            {/* Progress */}
            <div className="relative mt-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground font-medium">Complétion du profil</span>
                <span className="text-xs font-bold text-primary">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Formulaire ── */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Infos personnelles */}
            <SectionCard icon={User} title="Informations personnelles" description="Vos coordonnées apparaîtront en tête de CV" accentColor="blue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nom complet <RequiredBadge /></Label>
                  <Input placeholder="Jean Dupont" {...form.register('fullName')} aria-invalid={!!errors.fullName} className="h-9" />
                  <FieldError message={errors.fullName?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Titre professionnel <RequiredBadge /></Label>
                  <Input placeholder="Développeur Full-Stack" {...form.register('title')} aria-invalid={!!errors.title} className="h-9" />
                  <FieldError message={errors.title?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email <RequiredBadge /></Label>
                  <Input type="email" placeholder="jean@email.com" {...form.register('email')} aria-invalid={!!errors.email} className="h-9" />
                  <FieldError message={errors.email?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Téléphone <RequiredBadge /></Label>
                  <Input placeholder="06 00 00 00 00" {...form.register('phone')} aria-invalid={!!errors.phone} className="h-9" />
                  <FieldError message={errors.phone?.message} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Localisation <RequiredBadge /></Label>
                  <Input placeholder="Paris, France" {...form.register('location')} aria-invalid={!!errors.location} className="h-9" />
                  <FieldError message={errors.location?.message} />
                </div>
              </div>
            </SectionCard>

            {/* Liens */}
            <SectionCard
              icon={Link2} title="Liens & Réseaux sociaux" description="Enrichissez votre CV avec vos profils en ligne"
              accentColor="violet" collapsible defaultOpen={false}
              headerAction={
                <button type="button" onClick={() => appendSocial({ label: '', url: '' })}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" /> Lien
                </button>
              }
            >
              <div className="space-y-3 mt-4">
                {[
                  { icon: GitBranch, label: 'GitHub',    field: 'github'    as const, placeholder: 'https://github.com/votre-username',       color: 'text-foreground'  },
                  { icon: Link2,     label: 'LinkedIn',  field: 'linkedin'  as const, placeholder: 'https://linkedin.com/in/votre-profil',    color: 'text-blue-500'    },
                  { icon: Globe,     label: 'Portfolio', field: 'portfolio' as const, placeholder: 'https://votre-portfolio.com',              color: 'text-emerald-500' },
                ].map(({ icon: Icon, label, field, placeholder, color }) => (
                  <div key={field} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <Input type="url" placeholder={placeholder} {...form.register(field)} className="h-9 text-sm" />
                      <FieldError message={errors[field]?.message} />
                    </div>
                  </div>
                ))}
                {socialFields.map((field, i) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <Input {...form.register(`socialLinks.${i}.label`)} placeholder="Nom (ex: Behance)" className="w-28 h-9 text-sm shrink-0" />
                    <Input {...form.register(`socialLinks.${i}.url`)} placeholder="https://..." type="url" className="flex-1 h-9 text-sm" />
                    <button type="button" onClick={() => removeSocial(i)} className="w-8 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Résumé */}
            <SectionCard icon={Sparkles} title="Résumé professionnel" description="4 à 6 lignes percutantes sur votre valeur ajoutée" accentColor="cyan">
              <div className="mt-4 space-y-1.5">
                <Textarea {...form.register('summary')} placeholder="Décris ton parcours, tes points forts et ta valeur ajoutée..." rows={4} aria-invalid={!!errors.summary} className="resize-none text-sm" />
                <FieldError message={errors.summary?.message} />
              </div>
            </SectionCard>

            {/* Expériences */}
            <SectionCard
              icon={Briefcase} title="Expériences professionnelles" description="La plus récente en premier — au moins une requise"
              badge={expFields.length > 0 ? `${expFields.length}` : undefined} accentColor="amber"
              headerAction={
                <button type="button" onClick={() => appendExp({ company: '', position: '', dates: '', description: '' })}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              }
            >
              <div className="mt-4 space-y-4">
                {expFields.map((field, i) => (
                  <div key={field.id} className="relative rounded-xl border border-border bg-muted/20 p-4 group hover:border-amber-500/30 transition-colors">
                    <span className="absolute top-3 left-4 text-[10px] font-bold text-muted-foreground/40 font-mono">#{String(i + 1).padStart(2, '0')}</span>
                    <button type="button" onClick={() => removeExp(i)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Entreprise <RequiredBadge /></Label>
                        <Input {...form.register(`experiences.${i}.company`)} placeholder="Google, SNCF..." className="h-8 text-sm" />
                        <FieldError message={errors.experiences?.[i]?.company?.message} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Poste <RequiredBadge /></Label>
                        <Input {...form.register(`experiences.${i}.position`)} placeholder="Développeur Senior..." className="h-8 text-sm" />
                        <FieldError message={errors.experiences?.[i]?.position?.message} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Période <RequiredBadge /></Label>
                        <Input {...form.register(`experiences.${i}.dates`)} placeholder="Jan 2023 - Aujourd'hui" className="h-8 text-sm" />
                        <FieldError message={errors.experiences?.[i]?.dates?.message} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description <RequiredBadge /></Label>
                        <Textarea {...form.register(`experiences.${i}.description`)} rows={3} placeholder="Réalisations, résultats chiffrés, responsabilités..." className="resize-none text-sm" />
                        <FieldError message={errors.experiences?.[i]?.description?.message} />
                      </div>
                    </div>
                  </div>
                ))}
                <FieldError message={(errors.experiences as any)?.root?.message ?? (errors.experiences as any)?.message} />
              </div>
            </SectionCard>

            {/* Compétences */}
            <SectionCard
              icon={Code2} title="Compétences" description="Techniques et soft skills — au moins 3 requises"
              badge={form.watch('skills')?.filter(Boolean).length > 0 ? `${form.watch('skills').filter(Boolean).length}` : undefined}
              accentColor="emerald"
            >
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.watch('skills').map((_, i) => (
                    <div key={i} className="group flex items-center gap-1 bg-muted/50 border border-border rounded-lg overflow-hidden hover:border-emerald-500/40 transition-colors">
                      <Input {...form.register(`skills.${i}`)} placeholder="React, Python..." className="w-36 h-8 text-xs border-0 bg-transparent focus-visible:ring-0 px-2.5" />
                      <button type="button" onClick={() => form.setValue('skills', form.getValues('skills').filter((_, idx) => idx !== i))}
                        className="w-7 h-8 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors border-l border-border">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => form.setValue('skills', [...form.getValues('skills'), ''])}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-3 py-2 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all">
                  <Plus className="w-3 h-3" /> Ajouter une compétence
                </button>
                <FieldError message={(errors.skills as any)?.message} />
              </div>
            </SectionCard>

            {/* Projets */}
            <SectionCard
              icon={FolderGit2} title="Projets notables" description="Projets perso, académiques ou pro — optionnel mais recommandé"
              badge={projFields.length > 0 ? `${projFields.length}` : undefined} accentColor="violet"
              collapsible defaultOpen={projFields.length > 0}
              headerAction={
                <button type="button" onClick={() => appendProj({ name: '', description: '', technologies: '', dates: '', url: '' })}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              }
            >
              <div className="mt-4 space-y-4">
                {projFields.map((field, i) => {
                  const projectUrl = form.watch(`projects.${i}.url`);
                  return (
                    <div key={field.id} className="relative rounded-xl border border-border bg-muted/20 p-4 group hover:border-violet-500/30 transition-colors">
                      <span className="absolute top-3 left-4 text-[10px] font-bold text-muted-foreground/40 font-mono">#{String(i + 1).padStart(2, '0')}</span>
                      <button type="button" onClick={() => removeProj(i)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nom <RequiredBadge /></Label>
                          <Input {...form.register(`projects.${i}.name`)} placeholder="App de gestion..." className="h-8 text-sm" />
                          <FieldError message={errors.projects?.[i]?.name?.message} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Période</Label>
                          <Input {...form.register(`projects.${i}.dates`)} placeholder="2024" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-primary" /> Lien du projet
                          </Label>
                          <div className="flex gap-2">
                            <Input {...form.register(`projects.${i}.url`)} placeholder="https://github.com/..." type="url" className="flex-1 h-8 text-sm" />
                            {!!projectUrl && (
                              <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="h-8 px-2.5 flex items-center border border-border rounded-lg text-xs hover:bg-muted transition-colors shrink-0">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Technologies</Label>
                          <Input {...form.register(`projects.${i}.technologies`)} placeholder="Flutter, Supabase, API REST..." className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description <RequiredBadge /></Label>
                          <Textarea {...form.register(`projects.${i}.description`)} rows={2} placeholder="Décris le projet, les défis relevés et les résultats..." className="resize-none text-sm" />
                          <FieldError message={errors.projects?.[i]?.description?.message} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {projFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Aucun projet — cliquez sur Ajouter</p>}
              </div>
            </SectionCard>

            {/* Formation */}
            <SectionCard
              icon={GraduationCap} title="Formation" description="Au moins une formation requise"
              badge={eduFields.length > 0 ? `${eduFields.length}` : undefined} accentColor="cyan"
              headerAction={
                <button type="button" onClick={() => appendEdu({ school: '', degree: '', dates: '' })}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              }
            >
              <div className="mt-4 space-y-3">
                {eduFields.map((field, i) => (
                  <div key={field.id} className="relative rounded-xl border border-border bg-muted/20 p-4 group hover:border-cyan-500/30 transition-colors">
                    <button type="button" onClick={() => removeEdu(i)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Établissement <RequiredBadge /></Label>
                        <Input {...form.register(`education.${i}.school`)} placeholder="École 42..." className="h-8 text-sm" />
                        <FieldError message={errors.education?.[i]?.school?.message} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Diplôme <RequiredBadge /></Label>
                        <Input {...form.register(`education.${i}.degree`)} placeholder="Master Informatique..." className="h-8 text-sm" />
                        <FieldError message={errors.education?.[i]?.degree?.message} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Période <RequiredBadge /></Label>
                        <Input {...form.register(`education.${i}.dates`)} placeholder="2021 - 2024" className="h-8 text-sm" />
                        <FieldError message={errors.education?.[i]?.dates?.message} />
                      </div>
                    </div>
                  </div>
                ))}
                <FieldError message={(errors.education as any)?.message} />
              </div>
            </SectionCard>

            {/* Langues + Certifications */}
            <div className="grid md:grid-cols-2 gap-4">
              <SectionCard
                icon={Languages} title="Langues" accentColor="blue"
                collapsible defaultOpen={langFields.length > 0}
                headerAction={
                  <button type="button" onClick={() => appendLang({ language: '', level: '' })}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                }
              >
                <div className="mt-3 space-y-2">
                  {langFields.map((field, i) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <Input {...form.register(`languages.${i}.language`)} placeholder="Français" className="h-8 text-xs flex-1" />
                      <Input {...form.register(`languages.${i}.level`)} placeholder="Natif / B2" className="h-8 text-xs flex-1" />
                      <button type="button" onClick={() => removeLang(i)} className="text-muted-foreground hover:text-rose-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {langFields.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Cliquez sur + pour ajouter</p>}
                </div>
              </SectionCard>

              <SectionCard
                icon={Award} title="Certifications" accentColor="orange"
                collapsible defaultOpen={certFields.length > 0}
                headerAction={
                  <button type="button" onClick={() => appendCert({ name: '', issuer: '', date: '' })}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                }
              >
                <div className="mt-3 space-y-2">
                  {certFields.map((field, i) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <Input {...form.register(`certifications.${i}.name`)} placeholder="AWS Cloud..." className="h-8 text-xs flex-1" />
                      <Input {...form.register(`certifications.${i}.issuer`)} placeholder="Organisme" className="h-8 text-xs w-20" />
                      <Input {...form.register(`certifications.${i}.date`)} placeholder="2024" className="h-8 text-xs w-14" />
                      <button type="button" onClick={() => removeCert(i)} className="text-muted-foreground hover:text-rose-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {certFields.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Cliquez sur + pour ajouter</p>}
                </div>
              </SectionCard>
            </div>

            {/* Centres d'intérêt */}
            <SectionCard icon={Heart} title="Centres d'intérêt" description="Loisirs, passions, activités" accentColor="rose" collapsible defaultOpen={false}>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(form.watch('interests') || []).map((interest, i) =>
                    interest?.trim() ? (
                      <div key={i} className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 rounded-lg overflow-hidden hover:border-rose-500/40 transition-colors">
                        <Input {...form.register(`interests.${i}`)} placeholder="Football..." className="w-28 h-7 text-xs border-0 bg-transparent focus-visible:ring-0 px-2.5" />
                        <button type="button" onClick={() => form.setValue('interests', (form.getValues('interests') || []).filter((_, idx) => idx !== i))}
                          className="w-6 h-7 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors border-l border-rose-500/20">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
                <button type="button"
                  onClick={() => { const c = (form.getValues('interests') || []).filter(i => i?.trim()); form.setValue('interests', [...c, '']); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-3 py-2 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all">
                  <Plus className="w-3 h-3" /> Ajouter un loisir
                </button>
              </div>
            </SectionCard>

            {/* Save */}
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-lg ${
                saved
                  ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                  : 'bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {saved
                ? <><CheckCircle2 className="w-5 h-5" /> Profil sauvegardé !</>
                : <><Save className="w-5 h-5" /> Sauvegarder mon profil</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* Modal import */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={(importedProfile) => {
            form.reset(importedProfile);
            toast.success('CV importé ! Vérifiez les informations.');
          }}
        />
      )}
    </>
  );
}