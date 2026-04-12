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
import { Plus, Trash2, Save, GitBranch, Link2, Globe, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CVImport from '@/app/components/CVImport';

function RequiredBadge() {
  return <span className="text-red-500 text-xs font-semibold ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}

export default function ProfilePage() {
  const { profile, setProfile } = useCVStore();

  const form = useForm<UserProfileInput, any, UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: profile ?? {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      github: '',
      linkedin: '',
      portfolio: '',
      socialLinks: [],
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
  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({ control: form.control, name: 'socialLinks' });

  const onSubmit = (data: UserProfileForm) => {
    setProfile(data);
    toast.success('Profil sauvegardé !');
  };

  const errors = form.formState.errors;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil Professionnel</h1>
        <p className="text-muted-foreground mt-1">
          Les champs marqués <span className="text-red-500 font-semibold">*</span> sont obligatoires.
        </p>
      </div>
        <div className="space-y-2">
    <div className="flex items-center gap-2">
      <h2 className="text-base font-semibold">Importer un CV existant</h2>
      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">IA</span>
    </div>
    <p className="text-sm text-muted-foreground">
      Importez votre CV au format PDF, DOCX ou TXT — l'IA remplit automatiquement le formulaire ci-dessous.
    </p>
     <CVImport onImported={(importedProfile) => {
        form.reset(importedProfile);
      }} />
      </div>

      <div className="relative flex items-center gap-4">
        <div className="flex-1 border-t" />
        <span className="text-xs text-muted-foreground bg-background px-2">ou remplissez manuellement</span>
        <div className="flex-1 border-t" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* ── Infos personnelles ── */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Coordonnées de base qui apparaîtront sur le CV</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Nom complet <RequiredBadge /></Label>
              <Input placeholder="Jean Dupont" {...form.register('fullName')} aria-invalid={!!errors.fullName} />
              <FieldError message={errors.fullName?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Titre professionnel <RequiredBadge /></Label>
              <Input placeholder="Développeur Full-Stack" {...form.register('title')} aria-invalid={!!errors.title} />
              <FieldError message={errors.title?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Email <RequiredBadge /></Label>
              <Input type="email" placeholder="jean@email.com" {...form.register('email')} aria-invalid={!!errors.email} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone <RequiredBadge /></Label>
              <Input placeholder="06 00 00 00 00" {...form.register('phone')} aria-invalid={!!errors.phone} />
              <FieldError message={errors.phone?.message} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Localisation <RequiredBadge /></Label>
              <Input placeholder="Paris, France" {...form.register('location')} aria-invalid={!!errors.location} />
              <FieldError message={errors.location?.message} />
            </div>
          </CardContent>
        </Card>

        {/* ── Liens & Réseaux ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Liens & Réseaux sociaux
            </CardTitle>
            <CardDescription>Ajoutez vos profils en ligne pour enrichir votre CV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* GitHub */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                GitHub
              </Label>
              <Input
                type="url"
                placeholder="https://github.com/votre-username"
                {...form.register('github')}
              />
              <FieldError message={errors.github?.message} />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                LinkedIn
              </Label>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/votre-profil"
                {...form.register('linkedin')}
              />
              <FieldError message={errors.linkedin?.message} />
            </div>

            {/* Portfolio */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                Portfolio / Site web
              </Label>
              <Input
                type="url"
                placeholder="https://votre-portfolio.com"
                {...form.register('portfolio')}
              />
              <FieldError message={errors.portfolio?.message} />
            </div>

            {/* Liens personnalisés */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Autres liens (Behance, Dribbble, GitLab...)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSocial({ label: '', url: '' })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter un lien
                </Button>
              </div>
              <div className="space-y-3">
                {socialFields.map((field, i) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="w-36 shrink-0 space-y-1">
                      <Input
                        {...form.register(`socialLinks.${i}.label`)}
                        placeholder="Ex: Behance"
                        className="text-sm"
                      />
                      <FieldError message={errors.socialLinks?.[i]?.label?.message} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        {...form.register(`socialLinks.${i}.url`)}
                        placeholder="https://..."
                        type="url"
                        className="text-sm"
                      />
                      <FieldError message={errors.socialLinks?.[i]?.url?.message} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-400 shrink-0"
                      onClick={() => removeSocial(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {socialFields.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Aucun lien personnalisé — cliquez sur Ajouter un lien
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Résumé ── */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé professionnel <RequiredBadge /></CardTitle>
            <CardDescription>4 à 6 lignes percutantes sur ton parcours et ta valeur ajoutée</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('summary')}
              placeholder="Décris ton parcours, tes points forts et ta valeur ajoutée..."
              rows={5}
              aria-invalid={!!errors.summary}
            />
            <FieldError message={errors.summary?.message} />
          </CardContent>
        </Card>

        {/* ── Expériences ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Expériences professionnelles <RequiredBadge /></CardTitle>
              <CardDescription>La plus récente en premier — au moins une requise</CardDescription>
            </div>
            <Button
              type="button"
              onClick={() => appendExp({ company: '', position: '', dates: '', description: '' })}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {expFields.map((field, i) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                <span className="absolute top-3 left-4 text-xs font-bold text-muted-foreground/40">
                  #{i + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 h-8 w-8"
                  onClick={() => removeExp(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1.5">
                    <Label>Entreprise <RequiredBadge /></Label>
                    <Input
                      {...form.register(`experiences.${i}.company`)}
                      placeholder="Google, SNCF..."
                    />
                    <FieldError message={errors.experiences?.[i]?.company?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Poste <RequiredBadge /></Label>
                    <Input
                      {...form.register(`experiences.${i}.position`)}
                      placeholder="Développeur Senior..."
                    />
                    <FieldError message={errors.experiences?.[i]?.position?.message} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Période <RequiredBadge /></Label>
                    <Input
                      {...form.register(`experiences.${i}.dates`)}
                      placeholder="Jan 2023 - Aujourd'hui"
                    />
                    <FieldError message={errors.experiences?.[i]?.dates?.message} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description / Réalisations <RequiredBadge /></Label>
                  <Textarea
                    {...form.register(`experiences.${i}.description`)}
                    rows={3}
                    placeholder="Décris tes réalisations, résultats chiffrés, responsabilités..."
                  />
                  <FieldError message={errors.experiences?.[i]?.description?.message} />
                </div>
              </div>
            ))}
            <FieldError message={(errors.experiences as any)?.root?.message ?? (errors.experiences as any)?.message} />
          </CardContent>
        </Card>

        {/* ── Projets notables ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projets notables</CardTitle>
              <CardDescription>Projets perso, académiques ou pro — optionnel mais recommandé</CardDescription>
            </div>
            <Button
              type="button"
              onClick={() => appendProj({ name: '', description: '', technologies: '', dates: '', url: '' })}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {projFields.map((field, i) => {
              const projectUrl = form.watch(`projects.${i}.url`);
              return (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <span className="absolute top-3 left-4 text-xs font-bold text-muted-foreground/40">
                    #{i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-500 h-8 w-8"
                    onClick={() => removeProj(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1.5">
                      <Label>Nom du projet <RequiredBadge /></Label>
                      <Input
                        {...form.register(`projects.${i}.name`)}
                        placeholder="App de gestion, API REST..."
                      />
                      <FieldError message={errors.projects?.[i]?.name?.message} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Année / Période</Label>
                      <Input
                        {...form.register(`projects.${i}.dates`)}
                        placeholder="2024"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        Lien du projet
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          {...form.register(`projects.${i}.url`)}
                          placeholder="https://github.com/... ou https://demo.com/..."
                          type="url"
                          className="flex-1"
                        />
                        {!!projectUrl && (
                          <a
                            href={projectUrl as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1.5 px-3 rounded-md border border-border text-sm hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" /> Voir
                          </a>
                        )}
                      </div>
                      <FieldError message={errors.projects?.[i]?.url?.message} />
                      <p className="text-xs text-muted-foreground">
                        GitHub, démo live, documentation...
                      </p>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Technologies utilisées</Label>
                      <Input
                        {...form.register(`projects.${i}.technologies`)}
                        placeholder="Flutter, API REST, Supabase..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description <RequiredBadge /></Label>
                    <Textarea
                      {...form.register(`projects.${i}.description`)}
                      rows={3}
                      placeholder="Décris le projet, les défis relevés et les résultats..."
                    />
                    <FieldError message={errors.projects?.[i]?.description?.message} />
                  </div>
                </div>
              );
            })}
            {projFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun projet — cliquez sur Ajouter
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Compétences ── */}
        <Card>
          <CardHeader>
            <CardTitle>Compétences <RequiredBadge /></CardTitle>
            <CardDescription>Techniques et soft skills — au moins une requise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Affichage en grille pour meilleure lisibilité */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(form.watch('skills') || []).map((skill, i) => (
                  skill && skill.trim() ? (
                    <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <Input
                        {...form.register(`skills.${i}`)}
                        placeholder="Ex: React"
                        className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500 shrink-0"
                        onClick={() => {
                          const currentSkills = form.getValues('skills') || [];
                          form.setValue('skills', currentSkills.filter((_, idx) => idx !== i));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : null
                ))}
              </div>
              
              {/* Bouton Ajouter */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  const currentSkills = form.getValues('skills') || [];
                  // Filtrer les compétences vides avant d'ajouter
                  const filteredSkills = currentSkills.filter(s => s && s.trim());
                  form.setValue('skills', [...filteredSkills, '']);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Ajouter une compétence
              </Button>
              
              <FieldError message={(errors.skills as any)?.message} />
            </div>
          </CardContent>
        </Card>

        {/* ── Formation ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Formation <RequiredBadge /></CardTitle>
              <CardDescription>Au moins une formation requise</CardDescription>
            </div>
            <Button
              type="button"
              onClick={() => appendEdu({ school: '', degree: '', dates: '' })}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {eduFields.map((field, i) => (
              <div key={field.id} className="border rounded-lg p-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 h-8 w-8"
                  onClick={() => removeEdu(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Établissement <RequiredBadge /></Label>
                    <Input
                      {...form.register(`education.${i}.school`)}
                      placeholder="École 42, Paris..."
                    />
                    <FieldError message={errors.education?.[i]?.school?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Diplôme <RequiredBadge /></Label>
                    <Input
                      {...form.register(`education.${i}.degree`)}
                      placeholder="Master Informatique..."
                    />
                    <FieldError message={errors.education?.[i]?.degree?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Période <RequiredBadge /></Label>
                    <Input
                      {...form.register(`education.${i}.dates`)}
                      placeholder="2021 - 2024"
                    />
                    <FieldError message={errors.education?.[i]?.dates?.message} />
                  </div>
                </div>
              </div>
            ))}
            <FieldError message={(errors.education as any)?.message} />
          </CardContent>
        </Card>

        {/* ── Langues ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Langues</CardTitle>
            <Button
              type="button"
              onClick={() => appendLang({ language: '', level: '' })}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {langFields.map((field, i) => (
              <div key={field.id} className="flex gap-3 items-center">
                <Input
                  {...form.register(`languages.${i}.language`)}
                  placeholder="Français"
                  className="flex-1"
                />
                <Input
                  {...form.register(`languages.${i}.level`)}
                  placeholder="Natif / B2 / Intermédiaire"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-400 shrink-0"
                  onClick={() => removeLang(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {langFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Cliquez sur Ajouter pour renseigner vos langues
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Certifications ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certifications</CardTitle>
            <Button
              type="button"
              onClick={() => appendCert({ name: '', issuer: '', date: '' })}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {certFields.map((field, i) => (
              <div key={field.id} className="flex gap-3 items-center">
                <Input
                  {...form.register(`certifications.${i}.name`)}
                  placeholder="Nom de la certification"
                  className="flex-1"
                />
                <Input
                  {...form.register(`certifications.${i}.issuer`)}
                  placeholder="Organisme"
                  className="flex-1"
                />
                <Input
                  {...form.register(`certifications.${i}.date`)}
                  placeholder="2024"
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-400 shrink-0"
                  onClick={() => removeCert(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {certFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune certification — cliquez sur Ajouter
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Centres d'intérêt ── */}
        {/* ── Centres d'intérêt ── */}
      <Card>
        <CardHeader>
          <CardTitle>Centres d'intérêt</CardTitle>
          <CardDescription>Loisirs, passions, activités</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Affichage en grille */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(form.watch('interests') || []).map((interest, i) => (
                interest && interest.trim() ? (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Input
                      {...form.register(`interests.${i}`)}
                      placeholder="Ex: Football"
                      className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-500 shrink-0"
                      onClick={() => {
                        const currentInterests = form.getValues('interests') || [];
                        form.setValue('interests', currentInterests.filter((_, idx) => idx !== i));
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : null
              ))}
            </div>
            
            {/* Bouton Ajouter */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                const currentInterests = form.getValues('interests') || [];
                const filteredInterests = currentInterests.filter(i => i && i.trim());
                form.setValue('interests', [...filteredInterests, '']);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Ajouter un loisir
            </Button>
          </div>
        </CardContent>
      </Card>

        <Button type="submit" size="lg" className="w-full">
          <Save className="mr-2 h-5 w-5" />Sauvegarder mon profil
        </Button>
      </form>
    </div>
  );
}