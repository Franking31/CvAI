// app/components/cv/CVPreview.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Download, Edit3, Eye, X, Plus, Trash2, ChevronDown, ChevronUp, Check, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { buildCVHtml, TEMPLATES, CVData, TemplateId } from './CVTemplates';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'header' | 'summary' | 'experiences' | 'skills' | 'education' | 'projects' | 'languages' | 'certifications' | 'interests';

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CVPreview({ cv: initialCv }: { cv: CVData }) {
  const [cv, setCv] = useState<CVData>(initialCv);
  const [template, setTemplate] = useState<TemplateId>('classic');
  const [editMode, setEditMode] = useState(false);
  const [openSection, setOpenSection] = useState<Section | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const html = buildCVHtml(cv, template);

  // ─── Export PDF ──────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>CV — ${cv.fullName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: white; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0; size: A4; }
        }
      </style>
    </head><body>${html}<script>window.onload=()=>{window.print();}<\/script></body></html>`);
    win.document.close();
    toast.success('Impression / PDF ouverts !');
  }, [cv, html]);

  // ─── Helpers édition ─────────────────────────────────────────────────────
  const update = (patch: Partial<CVData>) => setCv(prev => ({ ...prev, ...patch }));
  const updateContact = (patch: Partial<CVData['contact']>) =>
    setCv(prev => ({ ...prev, contact: { ...prev.contact, ...patch } }));
  const updateExp = (i: number, patch: any) =>
    setCv(prev => { const e = [...prev.experiences]; e[i] = { ...e[i], ...patch }; return { ...prev, experiences: e }; });
  const updateExpBullet = (ei: number, bi: number, val: string) =>
    setCv(prev => { const e = [...prev.experiences]; e[ei] = { ...e[ei], bullets: e[ei].bullets.map((b,j) => j===bi ? val : b) }; return { ...prev, experiences: e }; });
  const addExpBullet = (ei: number) =>
    setCv(prev => { const e = [...prev.experiences]; e[ei] = { ...e[ei], bullets: [...e[ei].bullets, ''] }; return { ...prev, experiences: e }; });
  const removeExpBullet = (ei: number, bi: number) =>
    setCv(prev => { const e = [...prev.experiences]; e[ei] = { ...e[ei], bullets: e[ei].bullets.filter((_,j)=>j!==bi) }; return { ...prev, experiences: e }; });
  const removeExp = (i: number) =>
    setCv(prev => ({ ...prev, experiences: prev.experiences.filter((_,j)=>j!==i) }));
  const addExp = () =>
    setCv(prev => ({ ...prev, experiences: [...prev.experiences, { company:'', position:'', dates:'', bullets:[''] }] }));

  const toggle = (s: Section) => setOpenSection(prev => prev === s ? null : s);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
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
      <div className="flex items-center justify-between gap-3">
        <Button
          variant={editMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEditMode(v => !v)}
        >
          {editMode ? <><Check className="w-4 h-4 mr-2" />Terminer l'édition</> : <><Pencil className="w-4 h-4 mr-2" />Modifier le CV</>}
        </Button>
        <Button size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Exporter en PDF
        </Button>
      </div>

      {/* Editor panel */}
      {editMode && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Éditeur de sections</p>

            {/* Infos personnelles */}
            <EditorSection title="Informations personnelles" open={openSection==='header'} onToggle={()=>toggle('header')}>
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput label="Nom complet" value={cv.fullName} onChange={v=>update({fullName:v})} />
                <LabeledInput label="Titre du poste" value={cv.title} onChange={v=>update({title:v})} />
                <LabeledInput label="Email" value={cv.contact?.email||''} onChange={v=>updateContact({email:v})} />
                <LabeledInput label="Téléphone" value={cv.contact?.phone||''} onChange={v=>updateContact({phone:v})} />
                <LabeledInput label="Localisation" value={cv.contact?.location||''} onChange={v=>updateContact({location:v})} />
                <LabeledInput label="LinkedIn" value={cv.contact?.linkedin||''} onChange={v=>updateContact({linkedin:v})} />
              </div>
            </EditorSection>

            {/* Résumé */}
            <EditorSection title="Résumé professionnel" open={openSection==='summary'} onToggle={()=>toggle('summary')}>
              <Textarea
                className="min-h-[100px] text-sm"
                value={cv.professionalSummary}
                onChange={e=>update({professionalSummary:e.target.value})}
              />
            </EditorSection>

            {/* Expériences */}
            <EditorSection title={`Expériences (${cv.experiences?.length||0})`} open={openSection==='experiences'} onToggle={()=>toggle('experiences')}>
              <div className="space-y-4">
                {cv.experiences?.map((exp, ei) => (
                  <div key={ei} className="bg-white rounded-lg p-3 border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Expérience {ei+1}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={()=>removeExp(ei)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <LabeledInput label="Poste" value={exp.position} onChange={v=>updateExp(ei,{position:v})} />
                      <LabeledInput label="Entreprise" value={exp.company} onChange={v=>updateExp(ei,{company:v})} />
                      <LabeledInput label="Période" value={exp.dates} onChange={v=>updateExp(ei,{dates:v})} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Réalisations</p>
                      <div className="space-y-1">
                        {exp.bullets.map((b,bi) => (
                          <div key={bi} className="flex gap-1">
                            <Input className="text-xs h-7" value={b} onChange={e=>updateExpBullet(ei,bi,e.target.value)} />
                            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={()=>removeExpBullet(ei,bi)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={()=>addExpBullet(ei)}>
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
            <EditorSection title={`Compétences (${cv.skills?.length||0})`} open={openSection==='skills'} onToggle={()=>toggle('skills')}>
              <TagEditor
                tags={cv.skills||[]}
                onChange={tags=>update({skills:tags})}
                placeholder="Ajouter une compétence..."
              />
            </EditorSection>

            {/* Formation */}
            <EditorSection title={`Formation (${cv.education?.length||0})`} open={openSection==='education'} onToggle={()=>toggle('education')}>
              <div className="space-y-3">
                {cv.education?.map((edu, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">Formation {i+1}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={()=>setCv(p=>({...p,education:p.education.filter((_,j)=>j!==i)}))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <LabeledInput label="Diplôme" value={edu.degree} onChange={v=>setCv(p=>{const e=[...p.education];e[i]={...e[i],degree:v};return{...p,education:e};})} />
                      <LabeledInput label="Établissement" value={edu.school} onChange={v=>setCv(p=>{const e=[...p.education];e[i]={...e[i],school:v};return{...p,education:e};})} />
                      <LabeledInput label="Période" value={edu.dates} onChange={v=>setCv(p=>{const e=[...p.education];e[i]={...e[i],dates:v};return{...p,education:e};})} />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={()=>setCv(p=>({...p,education:[...p.education,{degree:'',school:'',dates:''}]}))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter une formation
                </Button>
              </div>
            </EditorSection>

            {/* Projets */}
            <EditorSection title={`Projets (${cv.projects?.length||0})`} open={openSection==='projects'} onToggle={()=>toggle('projects')}>
              <div className="space-y-3">
                {cv.projects?.map((p, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted-foreground">Projet {i+1}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={()=>setCv(prev=>({...prev,projects:prev.projects?.filter((_,j)=>j!==i)}))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <LabeledInput label="Nom" value={p.name} onChange={v=>setCv(prev=>{const ps=[...(prev.projects||[])];ps[i]={...ps[i],name:v};return{...prev,projects:ps};})} />
                      <LabeledInput label="Période" value={p.dates||''} onChange={v=>setCv(prev=>{const ps=[...(prev.projects||[])];ps[i]={...ps[i],dates:v};return{...prev,projects:ps};})} />
                    </div>
                    <Textarea className="text-xs min-h-[60px]" placeholder="Description" value={p.description} onChange={e=>setCv(prev=>{const ps=[...(prev.projects||[])];ps[i]={...ps[i],description:e.target.value};return{...prev,projects:ps};})} />
                    <LabeledInput label="Technologies" value={p.technologies||''} onChange={v=>setCv(prev=>{const ps=[...(prev.projects||[])];ps[i]={...ps[i],technologies:v};return{...prev,projects:ps};})} />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={()=>setCv(p=>({...p,projects:[...(p.projects||[]),{name:'',description:'',technologies:'',dates:''}]}))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter un projet
                </Button>
              </div>
            </EditorSection>

            {/* Langues */}
            <EditorSection title={`Langues (${cv.languages?.length||0})`} open={openSection==='languages'} onToggle={()=>toggle('languages')}>
              <div className="space-y-2">
                {cv.languages?.map((l, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input className="text-xs h-8 flex-1" placeholder="Langue" value={l.language} onChange={e=>setCv(p=>{const ls=[...(p.languages||[])];ls[i]={...ls[i],language:e.target.value};return{...p,languages:ls};})} />
                    <Input className="text-xs h-8 flex-1" placeholder="Niveau" value={l.level} onChange={e=>setCv(p=>{const ls=[...(p.languages||[])];ls[i]={...ls[i],level:e.target.value};return{...p,languages:ls};})} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={()=>setCv(p=>({...p,languages:p.languages?.filter((_,j)=>j!==i)}))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={()=>setCv(p=>({...p,languages:[...(p.languages||[]),{language:'',level:''}]}))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter
                </Button>
              </div>
            </EditorSection>

            {/* Certifications */}
            <EditorSection title={`Certifications (${cv.certifications?.length||0})`} open={openSection==='certifications'} onToggle={()=>toggle('certifications')}>
              <div className="space-y-2">
                {cv.certifications?.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input className="text-xs h-8 flex-1" placeholder="Nom" value={c.name} onChange={e=>setCv(p=>{const cs=[...(p.certifications||[])];cs[i]={...cs[i],name:e.target.value};return{...p,certifications:cs};})} />
                    <Input className="text-xs h-8 flex-1" placeholder="Organisme" value={c.issuer||''} onChange={e=>setCv(p=>{const cs=[...(p.certifications||[])];cs[i]={...cs[i],issuer:e.target.value};return{...p,certifications:cs};})} />
                    <Input className="text-xs h-8 w-20" placeholder="Année" value={c.date||''} onChange={e=>setCv(p=>{const cs=[...(p.certifications||[])];cs[i]={...cs[i],date:e.target.value};return{...p,certifications:cs};})} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={()=>setCv(p=>({...p,certifications:p.certifications?.filter((_,j)=>j!==i)}))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={()=>setCv(p=>({...p,certifications:[...(p.certifications||[]),{name:'',issuer:'',date:''}]}))}>
                  <Plus className="w-3 h-3 mr-1" /> Ajouter
                </Button>
              </div>
            </EditorSection>

            {/* Centres d'intérêt */}
            <EditorSection title="Centres d'intérêt" open={openSection==='interests'} onToggle={()=>toggle('interests')}>
              <TagEditor
                tags={cv.interests||[]}
                onChange={tags=>update({interests:tags})}
                placeholder="Ajouter un intérêt..."
              />
            </EditorSection>
          </CardContent>
        </Card>
      )}

      {/* CV Preview */}
      <div className="rounded-xl overflow-hidden border shadow-lg bg-white">
        <div className="overflow-x-auto">
          <div
            className="origin-top-left"
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
            <button onClick={() => onChange(tags.filter((_,j)=>j!==i))} className="hover:text-destructive ml-0.5">
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