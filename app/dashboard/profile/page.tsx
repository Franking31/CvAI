// app/dashboard/profile/page.tsx
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCVStore } from '@/lib/store';
import { userProfileSchema, type UserProfileForm, type UserProfileInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, setProfile } = useCVStore();

  // TFieldValues = UserProfileInput (type entrée, champs optionnels tolérés)
  // TContext     = any
  // TTransformedValues = UserProfileForm (type sortie Zod, tous les champs présents)
  const form = useForm<UserProfileInput, any, UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: profile || {
      fullName: '', title: '', email: '', phone: '', location: '', summary: '',
      experiences: [{ company: '', position: '', dates: '', description: '' }],
      skills: [''],
      education: [{ school: '', degree: '', dates: '' }],
      projects: [],
      languages: [],
      certifications: [],
      interests: [],
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: 'experiences' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: 'projects' });
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: 'languages' });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: 'certifications' });

  // data est typé UserProfileForm (output Zod) grâce au 3e générique
  const onSubmit = (data: UserProfileForm) => {
    setProfile(data);
    toast.success('Profil sauvegardé !');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil Professionnel</h1>
        <p className="text-muted-foreground mt-1">Remplis toutes les sections — elles seront utilisées pour générer ton CV.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* ── Infos personnelles ── */}
        <Card>
          <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { id: 'fullName', label: 'Nom complet', placeholder: 'Jean Dupont' },
              { id: 'title', label: 'Titre professionnel', placeholder: 'Développeur Full-Stack' },
              { id: 'email', label: 'Email', placeholder: 'jean@email.com', type: 'email' },
              { id: 'phone', label: 'Téléphone', placeholder: '06 00 00 00 00' },
              { id: 'location', label: 'Localisation', placeholder: 'Paris, France' },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input type={f.type || 'text'} placeholder={f.placeholder} {...form.register(f.id as any)} />
                {(form.formState.errors as any)[f.id] && <p className="text-red-500 text-xs">{(form.formState.errors as any)[f.id]?.message}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Résumé ── */}
        <Card>
          <CardHeader><CardTitle>Résumé professionnel</CardTitle><CardDescription>4 à 6 lignes percutantes</CardDescription></CardHeader>
          <CardContent>
            <Textarea {...form.register('summary')} placeholder="Décris ton parcours, tes points forts et ta valeur ajoutée..." rows={5} />
            {form.formState.errors.summary && <p className="text-red-500 text-xs mt-1">{form.formState.errors.summary.message}</p>}
          </CardContent>
        </Card>

        {/* ── Expériences ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Expériences professionnelles</CardTitle><CardDescription>La plus récente en premier</CardDescription></div>
            <Button type="button" onClick={() => appendExp({ company: '', position: '', dates: '', description: '' })} variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {expFields.map((field, i) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeExp(i)}><Trash2 className="h-4 w-4" /></Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Entreprise</Label><Input {...form.register(`experiences.${i}.company`)} /></div>
                  <div><Label>Poste</Label><Input {...form.register(`experiences.${i}.position`)} /></div>
                  <div className="md:col-span-2"><Label>Période (ex: Jan 2023 - Aujourd'hui)</Label><Input {...form.register(`experiences.${i}.dates`)} /></div>
                </div>
                <div><Label>Description / Réalisations</Label><Textarea {...form.register(`experiences.${i}.description`)} rows={3} /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Projets notables ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Projets notables</CardTitle><CardDescription>Projets perso, académiques ou pro</CardDescription></div>
            <Button type="button" onClick={() => appendProj({ name: '', description: '', technologies: '', dates: '' })} variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {projFields.map((field, i) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeProj(i)}><Trash2 className="h-4 w-4" /></Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Nom du projet</Label><Input {...form.register(`projects.${i}.name`)} placeholder="Application de gestion..." /></div>
                  <div><Label>Année / Période</Label><Input {...form.register(`projects.${i}.dates`)} placeholder="2024" /></div>
                  <div className="md:col-span-2"><Label>Technologies utilisées</Label><Input {...form.register(`projects.${i}.technologies`)} placeholder="Flutter, API REST, Supabase..." /></div>
                </div>
                <div><Label>Description</Label><Textarea {...form.register(`projects.${i}.description`)} rows={3} placeholder="Décris le projet, les défis et les résultats..." /></div>
              </div>
            ))}
            {projFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun projet — cliquez sur Ajouter</p>}
          </CardContent>
        </Card>

        {/* ── Compétences ── */}
        <Card>
          <CardHeader><CardTitle>Compétences</CardTitle><CardDescription>Techniques et soft skills</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {form.watch('skills').map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input {...form.register(`skills.${i}`)} placeholder="React, Python..." className="w-44 h-9 text-sm" />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-400 shrink-0"
                    onClick={() => form.setValue('skills', form.getValues('skills').filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => form.setValue('skills', [...form.getValues('skills'), ''])}>
              <Plus className="mr-1 h-4 w-4" />Ajouter
            </Button>
          </CardContent>
        </Card>

        {/* ── Formation ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Formation</CardTitle>
            <Button type="button" onClick={() => appendEdu({ school: '', degree: '', dates: '' })} variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {eduFields.map((field, i) => (
              <div key={field.id} className="border rounded-lg p-4 relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeEdu(i)}><Trash2 className="h-4 w-4" /></Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Établissement</Label><Input {...form.register(`education.${i}.school`)} /></div>
                  <div><Label>Diplôme</Label><Input {...form.register(`education.${i}.degree`)} /></div>
                  <div><Label>Période</Label><Input {...form.register(`education.${i}.dates`)} placeholder="2021 - 2024" /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Langues ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Langues</CardTitle></div>
            <Button type="button" onClick={() => appendLang({ language: '', level: '' })} variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {langFields.map((field, i) => (
              <div key={field.id} className="flex gap-3 items-center">
                <Input {...form.register(`languages.${i}.language`)} placeholder="Français" className="flex-1" />
                <Input {...form.register(`languages.${i}.level`)} placeholder="Natif / B2 / Intermédiaire" className="flex-1" />
                <Button type="button" variant="ghost" size="icon" className="text-red-400 shrink-0" onClick={() => removeLang(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            {langFields.length === 0 && <p className="text-sm text-muted-foreground">Cliquez sur Ajouter pour renseigner vos langues</p>}
          </CardContent>
        </Card>

        {/* ── Certifications ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Certifications</CardTitle></div>
            <Button type="button" onClick={() => appendCert({ name: '', issuer: '', date: '' })} variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {certFields.map((field, i) => (
              <div key={field.id} className="flex gap-3 items-center">
                <Input {...form.register(`certifications.${i}.name`)} placeholder="Nom de la certification" className="flex-1" />
                <Input {...form.register(`certifications.${i}.issuer`)} placeholder="Organisme" className="flex-1" />
                <Input {...form.register(`certifications.${i}.date`)} placeholder="2024" className="w-24" />
                <Button type="button" variant="ghost" size="icon" className="text-red-400 shrink-0" onClick={() => removeCert(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            {certFields.length === 0 && <p className="text-sm text-muted-foreground">Aucune certification — cliquez sur Ajouter</p>}
          </CardContent>
        </Card>

        {/* ── Centres d'intérêt ── */}
        <Card>
          <CardHeader><CardTitle>Centres d'intérêt</CardTitle><CardDescription>Loisirs, passions, activités</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(form.watch('interests') || []).map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input {...form.register(`interests.${i}`)} placeholder="Programmation, Gaming..." className="w-44 h-9 text-sm" />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-400 shrink-0"
                    onClick={() => form.setValue('interests', (form.getValues('interests') || []).filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-3"
              onClick={() => form.setValue('interests', [...(form.getValues('interests') || []), ''])}>
              <Plus className="mr-1 h-4 w-4" />Ajouter un loisir
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          <Save className="mr-2 h-5 w-5" />Sauvegarder mon profil
        </Button>
      </form>
    </div>
  );
}