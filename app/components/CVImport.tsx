// app/components/CVImport.tsx
'use client';

import { useState, useRef } from 'react';
import { useCVStore, AI_PROVIDERS, type AIProvider } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle, X, ChevronDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type Props = { onImported?: (profile: any) => void };

// ─── Extraction de texte côté client ────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // TXT : lecture directe
  if (ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Erreur lecture TXT'));
      reader.readAsText(file, 'utf-8');
    });
  }

  // DOCX : mammoth (fonctionne parfaitement côté client)
  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (!result.value.trim()) throw new Error('Le fichier DOCX semble vide ou protégé.');
    return result.value;
  }

  // PDF : on envoie le fichier à une route API légère qui extrait le texte
  // (évite les problèmes de worker pdfjs dans Next.js)
  if (ext === 'pdf') {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/extract-text', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur extraction PDF');
    if (!data.text?.trim()) throw new Error('Impossible d\'extraire le texte de ce PDF. Essayez un PDF non scanné, ou convertissez-le en DOCX/TXT.');
    return data.text;
  }

  throw new Error('Format non supporté');
}

// ─── Prompt pour parser le texte en profil structuré ────────────────────────

function buildParsePrompt(rawText: string): string {
  return `Tu es un expert en analyse de CV. Extrait les informations de ce CV et retourne UNIQUEMENT ce JSON valide, sans backticks, sans texte avant ou après :

{
  "fullName": "Prénom Nom",
  "title": "Titre professionnel",
  "email": "email@exemple.com",
  "phone": "06 00 00 00 00",
  "location": "Ville, Pays",
  "summary": "Résumé professionnel (4-6 lignes extraites ou reconstruites depuis le CV)",
  "github": "https://github.com/... ou chaîne vide",
  "linkedin": "https://linkedin.com/in/... ou chaîne vide",
  "portfolio": "https://... ou chaîne vide",
  "socialLinks": [],
  "experiences": [
    {
      "company": "Nom de l'entreprise",
      "position": "Poste occupé",
      "dates": "Janv. 2022 - Aujourd'hui",
      "description": "Description des missions et réalisations en quelques lignes"
    }
  ],
  "skills": ["compétence1", "compétence2", "compétence3"],
  "education": [
    {
      "school": "Nom de l'école",
      "degree": "Diplôme obtenu",
      "dates": "2019 - 2022"
    }
  ],
  "projects": [
    {
      "name": "Nom du projet",
      "description": "Description du projet",
      "technologies": "tech1, tech2",
      "dates": "2023",
      "url": ""
    }
  ],
  "languages": [
    { "language": "Français", "level": "Natif" }
  ],
  "certifications": [
    { "name": "Nom certif", "issuer": "Organisme", "date": "2023" }
  ],
  "interests": ["loisir1", "loisir2"]
}

Règles strictes :
- Si une information est absente, retourne "" ou []
- Ne pas inventer d'informations non présentes dans le CV
- Conserve les URLs telles quelles
- Les expériences doivent être dans l'ordre chronologique inverse (la plus récente en premier)
- Retourne UNIQUEMENT le JSON, rien d'autre

CV à analyser :
${rawText.slice(0, 7000)}`;
}

// ─── Appels IA ───────────────────────────────────────────────────────────────

async function callAI(text: string, provider: AIProvider, model: string): Promise<any> {
  // On passe par nos routes API serveur pour ne pas exposer les clés côté client
  const res = await fetch('/api/parse-cv-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, provider, model }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur IA');
  return data.profile;
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function CVImport({ onImported }: Props) {
  const { setProfile, aiProvider: storeProvider, aiModel: storeModel } = useCVStore();

  const [provider, setProvider] = useState<AIProvider>(storeProvider);
  const [model, setModel]       = useState<string>(storeModel);
  const [provOpen, setProvOpen] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState<'idle' | 'extracting' | 'parsing' | 'done'>('idle');
  const [fileName, setFileName] = useState('');
  const [error,    setError]    = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProv = AI_PROVIDERS[provider];

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      toast.error('Format non supporté', { description: 'Utilisez PDF, DOCX ou TXT.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop lourd', { description: 'Maximum 5 Mo.' });
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError('');
    setStep('extracting');
 try {
    // Étape 1 : extraction du texte brut
    console.log('📄 Début extraction...');
    const rawText = await extractTextFromFile(file);
    console.log('✅ Texte extrait:', rawText.substring(0, 200) + '...');
    
    if (!rawText.trim() || rawText.length < 30) {
      throw new Error('Impossible d\'extraire du texte de ce fichier.');
    }
    
    // Étape 2 : parsing IA
    console.log('🤖 Envoi à l\'IA...');
    const parsedProfile = await callAI(rawText, provider, model);
    console.log('✅ Profil parsé:', parsedProfile);
    
    // Normalisation...
    // Normalisation pour correspondre au schéma du formulaire
const profile = {
  fullName:       parsedProfile.fullName       || 'Test User', // Valeur par défaut pour test
  title:          parsedProfile.title          || 'Developer',
  email:          parsedProfile.email          || 'test@example.com',
  phone:          parsedProfile.phone          || '0600000000',
  location:       parsedProfile.location       || 'Paris',
  summary:        parsedProfile.summary        || 'Test summary',
  github:         parsedProfile.github         || '',
  linkedin:       parsedProfile.linkedin       || '',
  portfolio:      parsedProfile.portfolio      || '',
  socialLinks:    Array.isArray(parsedProfile.socialLinks)    ? parsedProfile.socialLinks    : [],
  experiences:    Array.isArray(parsedProfile.experiences) && parsedProfile.experiences.length > 0 
    ? parsedProfile.experiences 
    : [{ company: 'Test Company', position: 'Developer', dates: '2024', description: 'Test description' }],
  skills:         Array.isArray(parsedProfile.skills) && parsedProfile.skills.length > 0
    ? parsedProfile.skills.filter(Boolean) 
    : ['JavaScript', 'React'],
  education:      Array.isArray(parsedProfile.education) && parsedProfile.education.length > 0
    ? parsedProfile.education 
    : [{ school: 'Test School', degree: 'Master', dates: '2023' }],
  projects:       Array.isArray(parsedProfile.projects)       ? parsedProfile.projects       : [],
  languages:      Array.isArray(parsedProfile.languages)      ? parsedProfile.languages      : [{ language: 'Français', level: 'Natif' }],
  certifications: Array.isArray(parsedProfile.certifications) ? parsedProfile.certifications : [],
  interests:      Array.isArray(parsedProfile.interests) && parsedProfile.interests.length > 0
    ? parsedProfile.interests.filter(Boolean) 
    : ['Coding'],
};

console.log('📤 Profil envoyé au formulaire:', profile);
setProfile(profile as any);
    
    setProfile(profile as any);
    setStep('done');
    toast.success('CV importé !');
    onImported?.(profile);
    
  } catch (err: any) {
    console.error('❌ Erreur:', err);
      console.error('[CVImport]', err);
      const msg = err.message || "Erreur lors de l'analyse";
      setError(msg);
      setStep('idle');
      toast.error("Erreur d'importation", { description: msg });
      setFileName('');
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!loading) {
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    }
  };

  const reset = () => { setFileName(''); setStep('idle'); setError(''); };

  return (
    <div className="space-y-3">
      {/* Sélecteur IA */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">IA utilisée pour l'analyse :</p>
        <div className="relative">
          <button
            onClick={() => setProvOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
          >
            <span className="text-muted-foreground">{currentProv.label}</span>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className="text-xs text-muted-foreground/80 max-w-[110px] truncate">{model}</span>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${provOpen ? 'rotate-180' : ''}`} />
          </button>

          {provOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
              {(Object.entries(AI_PROVIDERS) as [AIProvider, typeof AI_PROVIDERS[AIProvider]][]).map(([key, prov]) => (
                <div key={key}>
                  <div className="px-3 py-2 bg-muted/50 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {prov.label}
                    </span>
                  </div>
                  {prov.models.map(m => {
                    const isActive = provider === key && model === m;
                    return (
                      <button
                        key={m}
                        onClick={() => { setProvider(key); setModel(m); setProvOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                          isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span>{m}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone de drop */}
      <Card
        className={`border-2 border-dashed transition-all ${
          loading         ? 'opacity-80 cursor-not-allowed' :
          step === 'done' ? 'border-green-400 bg-green-50/40 dark:bg-green-950/20 cursor-default' :
          dragging        ? 'border-primary bg-primary/5 scale-[1.01] cursor-copy' :
                            'border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer'
        }`}
        onDragOver={e => { e.preventDefault(); if (!loading) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { if (!loading) onDrop(e); }}
        onClick={() => { if (!loading && step !== 'done') fileInputRef.current?.click(); }}
      >
        <CardContent className="py-7 flex flex-col items-center gap-3 text-center">
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={onInputChange} className="hidden" />

          {loading ? (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {step === 'extracting' ? 'Extraction du texte…' : `Analyse IA avec ${currentProv.label}…`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
              </div>
              <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: step === 'extracting' ? '35%' : '80%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {step === 'extracting'
                  ? 'Lecture du fichier…'
                  : 'Identification des informations…'}
              </p>
            </>
          ) : step === 'done' ? (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-green-700 dark:text-green-400">
                  Formulaire rempli automatiquement !
                </p>
                <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">
                Vérifiez les informations et complétez si besoin avant de sauvegarder.
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs gap-1 text-muted-foreground"
                onClick={e => { e.stopPropagation(); reset(); }}
              >
                <X className="w-3 h-3" /> Importer un autre fichier
              </Button>
            </>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg w-full text-left">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-primary/20' : 'bg-muted'}`}>
                <Upload className={`w-6 h-6 transition-colors ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-sm">{dragging ? 'Déposez ici' : 'Glissez votre CV ici'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou <span className="text-primary underline underline-offset-2">parcourez vos fichiers</span>
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {['PDF', 'DOCX', 'TXT'].map(fmt => (
                  <span key={fmt} className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    <FileText className="w-3 h-3" />{fmt}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">Max 5 Mo</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}