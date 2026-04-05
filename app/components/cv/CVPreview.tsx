// app/components/cv/CVPreview.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Download, X, Plus, Trash2, ChevronDown, ChevronUp, Check, Pencil, Palette, RotateCcw, Loader2, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { buildCVHtml, TEMPLATES, CVData, TemplateId, CVStyle, DEFAULT_CV_STYLE } from './CVTemplates';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'header' | 'summary' | 'experiences' | 'skills' | 'education' | 'projects' | 'languages' | 'certifications' | 'interests';

const FONTS = [
  { label: 'Par défaut (selon template)', value: 'default' },
  { label: 'Georgia — Classique & sérieux', value: "Georgia,'Times New Roman',serif" },
  { label: 'Helvetica — Moderne & épuré', value: "'Helvetica Neue',Arial,sans-serif" },
  { label: 'Palatino — Élégant & raffiné', value: "'Palatino Linotype',Palatino,serif" },
  { label: 'Garamond — Prestige & lecture', value: "Garamond,'EB Garamond',Georgia,serif" },
  { label: 'Trebuchet — Créatif & dynamique', value: "'Trebuchet MS',Verdana,sans-serif" },
  { label: 'Courier New — Tech & monospace', value: "'Courier New',Courier,monospace" },
];

const PALETTES = [
  { label: 'Classique',   accent: '#1e293b' },
  { label: 'Bleu Marine', accent: '#1d3461' },
  { label: 'Bordeaux',    accent: '#881337' },
  { label: 'Vert Forêt',  accent: '#14532d' },
  { label: 'Violet',      accent: '#6b21a8' },
  { label: 'Ardoise',     accent: '#475569' },
  { label: 'Océan',       accent: '#0369a1' },
  { label: 'Cuivre',      accent: '#b45309' },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CVPreview({ cv: initialCv }: { cv: CVData }) {
  const [cv, setCv]                   = useState<CVData>(initialCv);
  const [template, setTemplate]       = useState<TemplateId>('classic');
  const [editMode, setEditMode]       = useState(false);
  const [styleMode, setStyleMode]     = useState(false);
  const [openSection, setOpenSection] = useState<Section | null>(null);
  const [cvStyle, setCvStyle]         = useState<CVStyle>(DEFAULT_CV_STYLE);

  const html = buildCVHtml(cv, template, cvStyle);
  const updateStyle = (patch: Partial<CVStyle>) => setCvStyle(prev => ({ ...prev, ...patch }));

  // ─── Aperçu dans nouvel onglet ───────────────────────────────────────────
  const handlePreview = useCallback(() => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Aperçu CV — ${cv.fullName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f1f5f9; display: flex; justify-content: center; padding: 32px 16px; }
        .page { background: white; width: 794px; box-shadow: 0 4px 32px rgba(0,0,0,0.15); }
        a { color: inherit; text-decoration: none; }
      </style>
    </head><body><div class="page">${html}</div></body></html>`);
    win.document.close();
  }, [cv, html]);

  // ─── Export PDF ──────────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    const toastId = toast.loading('Génération du PDF en cours…');
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          fileName: `CV_${cv.fullName.replace(/\s+/g, '_')}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur serveur');
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `CV_${cv.fullName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF téléchargé !', { id: toastId, description: 'Texte sélectionnable et liens cliquables.' });
    } catch (err: any) {
      console.error('[export-pdf]', err);
      toast.error('Génération PDF indisponible', {
        id: toastId,
        description: 'Ouverture en mode impression — utilisez Ctrl+P → Enregistrer en PDF.',
      });
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV — ${cv.fullName}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:white;}a{color:inherit;text-decoration:none;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{margin:0;size:A4;}}</style></head><body>${html}</body></html>`);
        win.document.close();
      }
    } finally {
      setExporting(false);
    }
  }, [cv, html]);

  // ─── Helpers édition ─────────────────────────────────────────────────────
  const update        = (patch: Partial<CVData>) => setCv(prev => ({ ...prev, ...patch }));
  const updateContact = (patch: Partial<CVData['contact']>) =>
    setCv(prev => ({ ...prev, contact: { ...prev.contact, ...patch } }));
  const updateExp = (i: number, patch: any) =>
    setCv(prev => { const e = [...prev.experiences]; e[i] = { ...e[i], ...patch }; return { ...prev, experiences: e }; });
  const updateExpBullet = (ei: number, bi: number, val: string) =>
    setCv(prev => { const e = [...prev.experiences]; e[ei] = { ...e[ei], bullets: e[ei].bullets.map((b, j) => j === bi ? val : b) }; return { ...prev, experiences: e }; });
  const addExpBullet = (ei: number) =>
    setCv(prev => { const e = [...prev.experiences]; e[ei] = { ...e[ei], bullets: [...e[ei].bullets, ''] }; return { ...prev, experiences: e }; });
  const removeExpBullet = (ei: number, bi: number) =>
    setCv(prev => { const e = [...prev.experiences]; e[ei] = { ...e[ei], bullets: e[ei].bullets.filter((_, j) => j !== bi) }; return { ...prev, experiences: e }; });
  const removeExp = (i: number) =>
    setCv(prev => ({ ...prev, experiences: prev.experiences.filter((_, j) => j !== i) }));
  const addExp = () =>
    setCv(prev => ({ ...prev, experiences: [...prev.experiences, { company: '', position: '', dates: '', bullets: [''] }] }));

  const toggle = (s: Section) => setOpenSection(prev => prev === s ? null : s);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Template picker */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Choisir un template</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`relative rounded-lg border-2 p-3 text-left transition-all hover:shadow-md ${
                template === t.id
                  ? 'border-primary shadow-sm ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="w-full h-1.5 rounded-full mb-2" style={{ background: t.accent }} />
              <p className="text-xs font-semibold leading-tight">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.description}</p>
              {template === t.id && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={editMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setEditMode(v => !v); setStyleMode(false); }}
        >
          {editMode
            ? <><Check className="w-4 h-4 mr-2" />Terminer l'édition</>
            : <><Pencil className="w-4 h-4 mr-2" />Modifier le CV</>}
        </Button>

        <Button
          variant={styleMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setStyleMode(v => !v); setEditMode(false); }}
          className={styleMode ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          <Palette className="w-4 h-4 mr-2" />
          {styleMode ? 'Fermer le style' : 'Personnaliser le style'}
        </Button>

        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />Aperçu
          </Button>
          <Button size="sm" onClick={handleExport} disabled={exporting}>
            {exporting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération PDF…</>
              : <><Download className="w-4 h-4 mr-2" />Télécharger PDF</>}
          </Button>
        </div>
      </div>

      {/* ── Panneau de style ─────────────────────────────────────────────── */}
      {styleMode && (
        <Card className="border-purple-200 bg-purple-50/40">
          <CardContent className="pt-4 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">🎨 Éditeur de style</p>
              <Button size="sm" variant="ghost" className="text-xs h-7 text-purple-600" onClick={() => setCvStyle(DEFAULT_CV_STYLE)}>
                <RotateCcw className="w-3 h-3 mr-1" /> Réinitialiser
              </Button>
            </div>

            {/* Grille des contrôles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

              {/* Police */}
              <div className="sm:col-span-2 md:col-span-3">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Police d'écriture</p>
                <select
                  className="w-full h-9 text-xs border rounded-md px-2 bg-white shadow-sm"
                  value={cvStyle.fontFamily}
                  onChange={e => updateStyle({ fontFamily: e.target.value })}
                >
                  {FONTS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Taille de police */}
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-muted-foreground font-medium">Taille de police</p>
                  <span className="text-xs font-bold text-purple-700">{cvStyle.fontSize}pt</span>
                </div>
                <input
                  type="range" min={8} max={13} step={0.5}
                  value={cvStyle.fontSize}
                  onChange={e => updateStyle({ fontSize: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Compact</span><span>Aéré</span>
                </div>
              </div>

              {/* Interligne */}
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-muted-foreground font-medium">Interligne</p>
                  <span className="text-xs font-bold text-purple-700">{cvStyle.lineHeight.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={1.2} max={2.0} step={0.05}
                  value={cvStyle.lineHeight}
                  onChange={e => updateStyle({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Serré</span><span>Large</span>
                </div>
              </div>

              {/* Espacement sections */}
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-muted-foreground font-medium">Espacement sections</p>
                  <span className="text-xs font-bold text-purple-700">{cvStyle.sectionSpacing}px</span>
                </div>
                <input
                  type="range" min={4} max={28} step={1}
                  value={cvStyle.sectionSpacing}
                  onChange={e => updateStyle({ sectionSpacing: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Dense</span><span>Espacé</span>
                </div>
              </div>

              {/* Marges horizontales */}
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-muted-foreground font-medium">Marges latérales</p>
                  <span className="text-xs font-bold text-purple-700">{cvStyle.marginH}px</span>
                </div>
                <input
                  type="range" min={10} max={60} step={2}
                  value={cvStyle.marginH}
                  onChange={e => updateStyle({ marginH: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5"
                />
              </div>

              {/* Marges verticales */}
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-muted-foreground font-medium">Marges haut / bas</p>
                  <span className="text-xs font-bold text-purple-700">{cvStyle.marginV}px</span>
                </div>
                <input
                  type="range" min={10} max={50} step={2}
                  value={cvStyle.marginV}
                  onChange={e => updateStyle({ marginV: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5"
                />
              </div>

              {/* Couleur accent */}
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Couleur d'accent</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={cvStyle.accentColor || '#1e293b'}
                    onChange={e => updateStyle({ accentColor: e.target.value })}
                    className="w-9 h-9 rounded-md cursor-pointer border shadow-sm"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{cvStyle.accentColor || '(template)'}</span>
                </div>
              </div>

              {/* Couleur texte */}
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Couleur du texte</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={cvStyle.textColor || '#1e293b'}
                    onChange={e => updateStyle({ textColor: e.target.value })}
                    className="w-9 h-9 rounded-md cursor-pointer border shadow-sm"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{cvStyle.textColor || '(template)'}</span>
                </div>
              </div>
            </div>

            {/* Palettes rapides */}
            <div className="pt-3 border-t border-purple-100">
              <p className="text-xs text-muted-foreground font-medium mb-2">Palettes rapides</p>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map(p => (
                  <button
                    key={p.label}
                    onClick={() => updateStyle({ accentColor: p.accent })}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all hover:shadow-sm ${
                      cvStyle.accentColor === p.accent ? 'border-purple-400 bg-purple-100' : 'border-border bg-white hover:border-purple-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: p.accent }} />
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => updateStyle({ accentColor: '', textColor: '' })}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium border-dashed border-border text-muted-foreground hover:border-purple-300 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Couleurs par défaut
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Panneau d'édition ────────────────────────────────────────────── */}
      {editMode && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Éditeur de sections</p>

            {/* Infos personnelles */}
            <EditorSection title="Informations personnelles" open={openSection === 'header'} onToggle={() => toggle('header')}>
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput label="Nom complet"     value={cv.fullName}             onChange={v => update({ fullName: v })} />
                <LabeledInput label="Titre du poste"  value={cv.title}                onChange={v => update({ title: v })} />
                <LabeledInput label="Email"           value={cv.contact?.email || ''} onChange={v => updateContact({ email: v })} />
                <LabeledInput label="Téléphone"       value={cv.contact?.phone || ''} onChange={v => updateContact({ phone: v })} />
                <LabeledInput label="Localisation"    value={cv.contact?.location || ''} onChange={v => updateContact({ location: v })} />
                <LabeledInput label="LinkedIn"        value={cv.contact?.linkedin || ''} onChange={v => updateContact({ linkedin: v })} />
              </div>
            </EditorSection>

            {/* Résumé */}
            <EditorSection title="Résumé professionnel" open={openSection === 'summary'} onToggle={() => toggle('summary')}>
              <Textarea
                className="min-h-[100px] text-sm"
                value={cv.professionalSummary}
                onChange={e => update({ professionalSummary: e.target.value })}
              />
            </EditorSection>

            {/* Expériences */}
            <EditorSection title={`Expériences (${cv.experiences?.length || 0})`} open={openSection === 'experiences'} onToggle={() => toggle('experiences')}>
              <div className="space-y-4">
                {cv.experiences?.map((exp, ei) => (
                  <div key={ei} className="bg-white rounded-lg p-3 border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Expérience {ei + 1}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeExp(ei)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <LabeledInput label="Poste"     value={exp.position} onChange={v => updateExp(ei, { position: v })} />
                      <LabeledInput label="Entreprise" value={exp.company}  onChange={v => updateExp(ei, { company: v })} />
                      <LabeledInput label="Période"   value={exp.dates}    onChange={v => updateExp(ei, { dates: v })} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Réalisations</p>
                      <div className="space-y-1">
                        {exp.bullets.map((b, bi) => (
                          <div key={bi} className="flex gap-1">
                            <Input className="text-xs h-7" value={b} onChange={e => updateExpBullet(ei, bi, e.target.value)} />
                            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeExpBullet(ei, bi)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => addExpBullet(ei)}>
                          <Plus className="w-3 h-3 mr-1" /> Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addExp}>
                  <Plus className="w-3 h-3 mr-1" /> Nouvelle expérience
                </Button>
              </div>
            </EditorSection>

            {/* Compétences */}
            <EditorSection title={`Compétences (${cv.skills?.length || 0})`} open={openSection === 'skills'} onToggle={() => toggle('skills')}>
              <TagEditor tags={cv.skills || []} onChange={tags => update({ skills: tags })} placeholder="Ajouter une compétence..." />
            </EditorSection>

            {/* Formation */}
            <EditorSection title={`Formation (${cv.education?.length || 0})`} open={openSection === 'education'} onToggle={() => toggle('education')}>
              <div className="space-y-3">
                {cv.education?.map((edu, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">Formation {i + 1}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive"
                        onClick={() => setCv(p => ({ ...p, education: p.education.filter((_, j) => j !== i) }))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <LabeledInput label="Diplôme"       value={edu.degree} onChange={v => setCv(p => { const e = [...p.education]; e[i] = { ...e[i], degree: v }; return { ...p, education: e }; })} />
                      <LabeledInput label="Établissement" value={edu.school}  onChange={v => setCv(p => { const e = [...p.education]; e[i] = { ...e[i], school: v }; return { ...p, education: e }; })} />
                      <LabeledInput label="Période"       value={edu.dates}   onChange={v => setCv(p => { const e = [...p.education]; e[i] = { ...e[i], dates: v }; return { ...p, education: e }; })} />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setCv(p => ({ ...p, education: [...p.education, { degree: '', school: '', dates: '' }] }))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter une formation
                </Button>
              </div>
            </EditorSection>

            {/* Projets */}
            <EditorSection title={`Projets (${cv.projects?.length || 0})`} open={openSection === 'projects'} onToggle={() => toggle('projects')}>
              <div className="space-y-3">
                {cv.projects?.map((p, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted-foreground">Projet {i + 1}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive"
                        onClick={() => setCv(prev => ({ ...prev, projects: prev.projects?.filter((_, j) => j !== i) }))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <LabeledInput label="Nom"     value={p.name}      onChange={v => setCv(prev => { const ps = [...(prev.projects || [])]; ps[i] = { ...ps[i], name: v };  return { ...prev, projects: ps }; })} />
                      <LabeledInput label="Période" value={p.dates || ''} onChange={v => setCv(prev => { const ps = [...(prev.projects || [])]; ps[i] = { ...ps[i], dates: v }; return { ...prev, projects: ps }; })} />
                    </div>
                    <Textarea className="text-xs min-h-[60px]" placeholder="Description" value={p.description}
                      onChange={e => setCv(prev => { const ps = [...(prev.projects || [])]; ps[i] = { ...ps[i], description: e.target.value }; return { ...prev, projects: ps }; })} />
                    <LabeledInput label="Technologies" value={p.technologies || ''}
                      onChange={v => setCv(prev => { const ps = [...(prev.projects || [])]; ps[i] = { ...ps[i], technologies: v }; return { ...prev, projects: ps }; })} />
                  </div>
                ))}
                <Button size="sm" variant="outline"
                  onClick={() => setCv(p => ({ ...p, projects: [...(p.projects || []), { name: '', description: '', technologies: '', dates: '' }] }))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter un projet
                </Button>
              </div>
            </EditorSection>

            {/* Langues */}
            <EditorSection title={`Langues (${cv.languages?.length || 0})`} open={openSection === 'languages'} onToggle={() => toggle('languages')}>
              <div className="space-y-2">
                {cv.languages?.map((l, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input className="text-xs h-8 flex-1" placeholder="Langue" value={l.language}
                      onChange={e => setCv(p => { const ls = [...(p.languages || [])]; ls[i] = { ...ls[i], language: e.target.value }; return { ...p, languages: ls }; })} />
                    <Input className="text-xs h-8 flex-1" placeholder="Niveau" value={l.level}
                      onChange={e => setCv(p => { const ls = [...(p.languages || [])]; ls[i] = { ...ls[i], level: e.target.value }; return { ...p, languages: ls }; })} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => setCv(p => ({ ...p, languages: p.languages?.filter((_, j) => j !== i) }))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setCv(p => ({ ...p, languages: [...(p.languages || []), { language: '', level: '' }] }))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter
                </Button>
              </div>
            </EditorSection>

            {/* Certifications */}
            <EditorSection title={`Certifications (${cv.certifications?.length || 0})`} open={openSection === 'certifications'} onToggle={() => toggle('certifications')}>
              <div className="space-y-2">
                {cv.certifications?.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input className="text-xs h-8 flex-1" placeholder="Nom"      value={c.name}        onChange={e => setCv(p => { const cs = [...(p.certifications || [])]; cs[i] = { ...cs[i], name: e.target.value };   return { ...p, certifications: cs }; })} />
                    <Input className="text-xs h-8 flex-1" placeholder="Organisme" value={c.issuer || ''} onChange={e => setCv(p => { const cs = [...(p.certifications || [])]; cs[i] = { ...cs[i], issuer: e.target.value }; return { ...p, certifications: cs }; })} />
                    <Input className="text-xs h-8 w-20"   placeholder="Année"    value={c.date || ''}  onChange={e => setCv(p => { const cs = [...(p.certifications || [])]; cs[i] = { ...cs[i], date: e.target.value };   return { ...p, certifications: cs }; })} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => setCv(p => ({ ...p, certifications: p.certifications?.filter((_, j) => j !== i) }))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setCv(p => ({ ...p, certifications: [...(p.certifications || []), { name: '', issuer: '', date: '' }] }))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter
                </Button>
              </div>
            </EditorSection>

            {/* Centres d'intérêt */}
            <EditorSection title="Centres d'intérêt" open={openSection === 'interests'} onToggle={() => toggle('interests')}>
              <TagEditor tags={cv.interests || []} onChange={tags => update({ interests: tags })} placeholder="Ajouter un intérêt..." />
            </EditorSection>
          </CardContent>
        </Card>
      )}

      {/* CV Preview */}
      <div className="rounded-xl overflow-hidden border shadow-lg bg-white">
        <div className="overflow-x-auto">
          <div
            style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.3%', minHeight: '600px' }}
          >
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function EditorSection({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t">{children}</div>}
    </div>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <Input className="h-8 text-xs" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function TagEditor({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput(''); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t, i) => (
          <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
            {t}
            <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-destructive ml-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          className="h-8 text-xs flex-1"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <Button size="sm" variant="outline" className="h-8" onClick={add}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}