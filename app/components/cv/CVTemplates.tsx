// app/components/cv/CVTemplates.tsx
'use client';

export type CVData = {
  fullName: string;
  title: string;
  contact: { email: string; phone: string; location: string; linkedin?: string };
  professionalSummary: string;
  experiences: { company: string; position: string; dates: string; bullets: string[] }[];
  skills: string[];
  education: { school: string; degree: string; dates: string }[];
  projects?: { name: string; description: string; technologies?: string; dates?: string }[];
  languages?: { language: string; level: string }[];
  certifications?: { name: string; issuer?: string; date?: string }[];
  interests?: string[];
};

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'creative' | 'tech';

export const TEMPLATES: { id: TemplateId; label: string; description: string; accent: string }[] = [
  { id: 'classic',   label: 'Classique',  description: 'Sérieux, serif, idéal RH/finance',   accent: '#1e293b' },
  { id: 'modern',    label: 'Moderne',    description: 'Deux colonnes, épuré, tech/startup',  accent: '#3b82f6' },
  { id: 'minimal',   label: 'Minimaliste',description: 'Typographie soignée, création/design',accent: '#b45309' },
  { id: 'executive', label: 'Executive',  description: 'Prestige, bleu marine, top management',accent: '#1d3461' },
  { id: 'creative',  label: 'Créatif',    description: 'Graphique, couleur, marketing/UX',    accent: '#7c3aed' },
  { id: 'tech',      label: 'Tech',       description: 'Dark sidebar, monospace, dev/data',    accent: '#059669' },
];

export function buildCVHtml(cv: CVData, template: TemplateId): string {
  switch (template) {
    case 'modern':    return buildModernHtml(cv);
    case 'minimal':   return buildMinimalHtml(cv);
    case 'executive': return buildExecutiveHtml(cv);
    case 'creative':  return buildCreativeHtml(cv);
    case 'tech':      return buildTechHtml(cv);
    default:          return buildClassicHtml(cv);
  }
}

// ─── CLASSIQUE ────────────────────────────────────────────────────────────────
function buildClassicHtml(cv: CVData): string {
  return `<div style="font-family: Georgia,'Times New Roman',serif;color:#1e293b;background:white;padding:32px 40px;max-width:794px;margin:0 auto;font-size:10.5pt;line-height:1.5;">
  <div style="border-bottom:2px solid #1e293b;padding-bottom:16px;margin-bottom:20px;">
    <h1 style="font-size:26pt;font-weight:bold;margin:0 0 4px 0;color:#0f172a;">${cv.fullName}</h1>
    <p style="font-size:12pt;color:#64748b;margin:0 0 10px 0;font-style:italic;">${cv.title}</p>
    <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:9pt;color:#64748b;">
      ${cv.contact?.email?`<span>✉ ${cv.contact.email}</span>`:''}
      ${cv.contact?.phone?`<span>✆ ${cv.contact.phone}</span>`:''}
      ${cv.contact?.location?`<span>📍 ${cv.contact.location}</span>`:''}
      ${cv.contact?.linkedin?`<span>🔗 ${cv.contact.linkedin}</span>`:''}
    </div>
  </div>
  ${cv.professionalSummary?cs('Profil professionnel',`<p style="margin:0;color:#334155;font-size:10pt;">${cv.professionalSummary}</p>`):''}
  ${cv.experiences?.length?cs('Expériences professionnelles',cv.experiences.map(e=>`<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><span><strong>${e.position}</strong> <span style="color:#64748b;">· ${e.company}</span></span><span style="font-size:9pt;color:#94a3b8;white-space:nowrap;">${e.dates}</span></div><ul style="margin:6px 0 0 0;padding-left:16px;">${e.bullets?.map(b=>`<li style="margin-bottom:3px;color:#334155;font-size:10pt;">${b}</li>`).join('')||''}</ul></div>`).join('')):''}
  ${cv.projects?.length?cs('Projets notables',cv.projects.map(p=>`<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;"><strong>${p.name}</strong>${p.dates?`<span style="font-size:9pt;color:#94a3b8;">${p.dates}</span>`:''}</div><p style="margin:4px 0;color:#334155;font-size:10pt;">${p.description}</p>${p.technologies?`<p style="margin:2px 0;font-size:9pt;color:#64748b;font-style:italic;">${p.technologies}</p>`:''}</div>`).join('')):''}
  ${cv.skills?.length?cs('Compétences',`<p style="margin:0;color:#334155;">${cv.skills.join(' · ')}</p>`):''}
  ${cv.education?.length?cs('Formation',cv.education.map(e=>`<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span><strong>${e.degree}</strong> <span style="color:#64748b;">· ${e.school}</span></span><span style="font-size:9pt;color:#94a3b8;">${e.dates}</span></div>`).join('')):''}
  ${cv.languages?.length||cv.certifications?.length||cv.interests?.length?`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:4px;">${cv.languages?.length?`<div><p style="font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 6px 0;">Langues</p>${cv.languages.map(l=>`<p style="margin:2px 0;font-size:10pt;">${l.language} <span style="color:#64748b;">— ${l.level}</span></p>`).join('')}</div>`:'<div></div>'}${cv.certifications?.length?`<div><p style="font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 6px 0;">Certifications</p>${cv.certifications.map(c=>`<p style="margin:2px 0;font-size:10pt;font-weight:600;">${c.name}${c.issuer?`<span style="font-weight:normal;color:#64748b;"> · ${c.issuer}</span>`:''}</p>`).join('')}</div>`:'<div></div>'}${cv.interests?.length?`<div><p style="font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 6px 0;">Centres d'intérêt</p><p style="margin:0;color:#334155;font-size:10pt;">${cv.interests.join(' · ')}</p></div>`:'<div></div>'}</div>`:''}
</div>`;
}
function cs(t:string,c:string){return `<div style="margin-bottom:18px;"><h2 style="font-size:8.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin:0 0 10px 0;">${t}</h2>${c}</div>`;}

// ─── MODERNE ──────────────────────────────────────────────────────────────────
function buildModernHtml(cv: CVData): string {
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;background:white;display:flex;width:794px;min-height:1123px;">
  <div style="width:260px;background:#1e293b;color:white;padding:28px 22px;flex-shrink:0;">
    <h1 style="font-size:18pt;font-weight:bold;margin:0 0 6px 0;line-height:1.2;color:white;">${cv.fullName}</h1>
    <p style="font-size:10pt;color:#93c5fd;margin:0 0 22px 0;font-weight:500;">${cv.title}</p>
    ${mss('Contact',`${cv.contact?.email?`<div style="margin-bottom:6px;font-size:9pt;color:#cbd5e1;word-break:break-all;">✉ ${cv.contact.email}</div>`:''}${cv.contact?.phone?`<div style="margin-bottom:6px;font-size:9pt;color:#cbd5e1;">✆ ${cv.contact.phone}</div>`:''}${cv.contact?.location?`<div style="font-size:9pt;color:#cbd5e1;">📍 ${cv.contact.location}</div>`:''}`)}
    ${cv.skills?.length?mss('Compétences',cv.skills.map(s=>`<span style="display:inline-block;background:rgba(255,255,255,0.1);color:#e2e8f0;font-size:8.5pt;padding:3px 8px;border-radius:4px;margin:2px 2px 2px 0;">${s}</span>`).join('')):''}
    ${cv.languages?.length?mss('Langues',cv.languages.map(l=>`<p style="margin:3px 0;font-size:9pt;color:#cbd5e1;"><strong style="color:white;">${l.language}</strong> — ${l.level}</p>`).join('')):''}
    ${cv.certifications?.length?mss('Certifications',cv.certifications.map(c=>`<p style="margin:3px 0;font-size:9pt;font-weight:600;color:white;">${c.name}${c.issuer?`<span style="font-weight:normal;color:#94a3b8;"> · ${c.issuer}</span>`:''}</p>`).join('')):''}
    ${cv.education?.length?mss('Formation',cv.education.map(e=>`<div style="margin-bottom:10px;"><p style="font-weight:600;font-size:9.5pt;color:white;margin:0;">${e.degree}</p><p style="font-size:9pt;color:#94a3b8;margin:1px 0;">${e.school}</p><p style="font-size:8.5pt;color:#64748b;margin:0;">${e.dates}</p></div>`).join('')):''}
    ${cv.interests?.length?mss("Centres d'intérêt",`<p style="font-size:9pt;color:#cbd5e1;margin:0;">${cv.interests.join(' · ')}</p>`):''}
  </div>
  <div style="flex:1;padding:28px;background:white;">
    ${cv.professionalSummary?mms('À propos',`<p style="color:#475569;font-size:10pt;line-height:1.6;margin:0;">${cv.professionalSummary}</p>`):''}
    ${cv.experiences?.length?mms('Expériences',cv.experiences.map(e=>`<div style="padding-left:14px;border-left:2px solid #bfdbfe;margin-bottom:16px;position:relative;"><div style="width:8px;height:8px;border-radius:50%;background:#3b82f6;position:absolute;left:-5px;top:4px;"></div><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;"><div><strong style="font-size:10.5pt;color:#0f172a;">${e.position}</strong><br><span style="color:#3b82f6;font-size:9.5pt;">${e.company}</span></div><span style="font-size:8.5pt;color:#94a3b8;white-space:nowrap;margin-left:8px;">${e.dates}</span></div><ul style="margin:6px 0 0 0;padding-left:14px;">${e.bullets?.map(b=>`<li style="font-size:9.5pt;color:#475569;margin-bottom:3px;">${b}</li>`).join('')||''}</ul></div>`).join('')):''}
    ${cv.projects?.length?mms('Projets',cv.projects.map(p=>`<div style="border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin-bottom:10px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong style="font-size:10pt;color:#0f172a;">${p.name}</strong>${p.dates?`<span style="font-size:8.5pt;color:#94a3b8;">${p.dates}</span>`:''}</div><p style="margin:0 0 6px 0;font-size:9.5pt;color:#475569;">${p.description}</p>${p.technologies?`<p style="margin:0;font-size:8.5pt;color:#3b82f6;font-style:italic;">${p.technologies}</p>`:''}</div>`).join('')):''}
  </div>
</div>`;
}
function mss(t:string,c:string){return `<div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:14px;margin-top:14px;"><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#93c5fd;margin:0 0 10px 0;">${t}</p>${c}</div>`;}
function mms(t:string,c:string){return `<div style="margin-bottom:22px;"><h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin:0 0 12px 0;display:flex;align-items:center;gap:8px;"><span style="flex:1;height:1px;background:#e2e8f0;display:inline-block;"></span>${t}<span style="flex:1;height:1px;background:#e2e8f0;display:inline-block;"></span></h2>${c}</div>`;}

// ─── MINIMALISTE ──────────────────────────────────────────────────────────────
function buildMinimalHtml(cv: CVData): string {
  return `<div style="font-family:'Palatino Linotype',Palatino,serif;color:#292524;background:white;padding:36px 44px;max-width:794px;margin:0 auto;font-size:10.5pt;line-height:1.55;">
  <div style="margin-bottom:24px;border-bottom:1px solid #e7e5e4;padding-bottom:18px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <h1 style="font-size:28pt;font-weight:normal;margin:0;color:#1c1917;letter-spacing:-0.5px;">${cv.fullName}</h1>
      <p style="font-size:8pt;text-transform:uppercase;letter-spacing:0.2em;color:#b45309;margin:8px 0 0 0;">${cv.title}</p>
    </div>
    <div style="text-align:right;font-size:8.5pt;color:#78716c;line-height:1.8;">
      ${cv.contact?.email?`<div>${cv.contact.email}</div>`:''}
      ${cv.contact?.phone?`<div>${cv.contact.phone}</div>`:''}
      ${cv.contact?.location?`<div>${cv.contact.location}</div>`:''}
    </div>
  </div>
  ${cv.professionalSummary?`<div style="margin-bottom:22px;border-left:2px solid #f59e0b;padding-left:14px;"><p style="margin:0;color:#57534e;font-style:italic;font-size:10pt;">${cv.professionalSummary}</p></div>`:''}
  ${cv.experiences?.length?mins('Expériences',cv.experiences.map(e=>`<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span><strong>${e.position}</strong> <span style="color:#78716c;">@ ${e.company}</span></span><span style="font-size:9pt;color:#a8a29e;">${e.dates}</span></div><ul style="margin:0;padding-left:16px;">${e.bullets?.map(b=>`<li style="font-size:9.5pt;color:#57534e;margin-bottom:2px;">${b}</li>`).join('')||''}</ul></div>`).join('')):''}
  ${cv.projects?.length?mins('Projets notables',cv.projects.map(p=>`<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;"><strong>${p.name}</strong>${p.dates?`<span style="font-size:9pt;color:#a8a29e;">${p.dates}</span>`:''}</div><p style="margin:3px 0;color:#57534e;font-size:9.5pt;">${p.description}</p>${p.technologies?`<p style="margin:0;font-size:9pt;color:#b45309;font-style:italic;">${p.technologies}</p>`:''}</div>`).join('')):''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
    ${cv.skills?.length?`<div><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin:0 0 6px 0;">Compétences</p><p style="color:#57534e;font-size:9.5pt;">${cv.skills.join(' · ')}</p></div>`:''}
    ${cv.education?.length?`<div><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin:0 0 6px 0;">Formation</p>${cv.education.map(e=>`<div style="margin-bottom:6px;"><p style="font-weight:600;margin:0;font-size:9.5pt;">${e.degree}</p><p style="color:#78716c;margin:1px 0;font-size:9pt;">${e.school} · ${e.dates}</p></div>`).join('')}</div>`:''}
  </div>
  ${cv.languages?.length||cv.certifications?.length||cv.interests?.length?`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:16px;padding-top:14px;border-top:1px solid #e7e5e4;">${cv.languages?.length?`<div><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin:0 0 6px 0;">Langues</p>${cv.languages.map(l=>`<p style="margin:2px 0;font-size:9.5pt;">${l.language} <span style="color:#78716c;">— ${l.level}</span></p>`).join('')}</div>`:'<div></div>'}${cv.certifications?.length?`<div><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin:0 0 6px 0;">Certifications</p>${cv.certifications.map(c=>`<p style="margin:2px 0;font-size:9.5pt;font-weight:600;">${c.name}${c.issuer?`<span style="font-weight:normal;color:#78716c;"> · ${c.issuer}</span>`:''}</p>`).join('')}</div>`:'<div></div>'}${cv.interests?.length?`<div><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin:0 0 6px 0;">Centres d'intérêt</p><p style="color:#57534e;font-size:9.5pt;margin:0;">${cv.interests.join(' · ')}</p></div>`:'<div></div>'}</div>`:''}
</div>`;
}
function mins(t:string,c:string){return `<div style="margin-bottom:20px;"><h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#b45309;margin:0 0 10px 0;">${t}</h2>${c}</div>`;}

// ─── EXECUTIVE ────────────────────────────────────────────────────────────────
function buildExecutiveHtml(cv: CVData): string {
  return `<div style="font-family:'Garamond','EB Garamond',Georgia,serif;color:#1a1a2e;background:white;padding:0;max-width:794px;margin:0 auto;font-size:10.5pt;line-height:1.6;">
  <div style="background:#1d3461;color:white;padding:32px 44px 28px;">
    <div style="border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:20px;margin-bottom:20px;">
      <h1 style="font-size:30pt;font-weight:normal;margin:0;letter-spacing:1px;color:white;">${cv.fullName}</h1>
      <p style="font-size:11pt;color:#93c5fd;margin:6px 0 0 0;letter-spacing:3px;text-transform:uppercase;font-size:9pt;">${cv.title}</p>
    </div>
    <div style="display:flex;gap:28px;font-size:9pt;color:rgba(255,255,255,0.75);">
      ${cv.contact?.email?`<span>✉ ${cv.contact.email}</span>`:''}
      ${cv.contact?.phone?`<span>✆ ${cv.contact.phone}</span>`:''}
      ${cv.contact?.location?`<span>📍 ${cv.contact.location}</span>`:''}
      ${cv.contact?.linkedin?`<span>🔗 ${cv.contact.linkedin}</span>`:''}
    </div>
  </div>
  <div style="padding:32px 44px;">
    ${cv.professionalSummary?`<div style="background:#f0f4ff;border-left:4px solid #1d3461;padding:16px 20px;margin-bottom:28px;"><p style="margin:0;font-style:italic;color:#1e3a5f;font-size:10.5pt;line-height:1.7;">${cv.professionalSummary}</p></div>`:''}
    ${cv.experiences?.length?exs('Parcours professionnel',cv.experiences.map(e=>`<div style="margin-bottom:20px;display:grid;grid-template-columns:160px 1fr;gap:16px;"><div style="text-align:right;"><p style="font-size:8.5pt;color:#94a3b8;margin:0;white-space:nowrap;">${e.dates}</p><p style="font-size:9pt;color:#1d3461;font-weight:600;margin:4px 0 0 0;">${e.company}</p></div><div style="border-left:1px solid #e2e8f0;padding-left:16px;"><p style="font-weight:700;font-size:10.5pt;margin:0 0 6px 0;color:#1a1a2e;">${e.position}</p><ul style="margin:0;padding-left:14px;">${e.bullets?.map(b=>`<li style="margin-bottom:4px;color:#334155;font-size:10pt;">${b}</li>`).join('')||''}</ul></div></div>`).join('')):''}
    ${cv.education?.length?exs('Formation',cv.education.map(e=>`<div style="display:grid;grid-template-columns:160px 1fr;gap:16px;margin-bottom:12px;"><div style="text-align:right;font-size:8.5pt;color:#94a3b8;">${e.dates}</div><div style="border-left:1px solid #e2e8f0;padding-left:16px;"><strong>${e.degree}</strong><span style="color:#64748b;"> — ${e.school}</span></div></div>`).join('')):''}
    ${cv.projects?.length?exs('Projets stratégiques',cv.projects.map(p=>`<div style="margin-bottom:14px;display:grid;grid-template-columns:160px 1fr;gap:16px;"><div style="text-align:right;font-size:8.5pt;color:#94a3b8;">${p.dates||''}</div><div style="border-left:1px solid #e2e8f0;padding-left:16px;"><strong style="color:#1d3461;">${p.name}</strong><p style="margin:4px 0;color:#334155;font-size:9.5pt;">${p.description}</p>${p.technologies?`<p style="margin:0;font-size:8.5pt;color:#64748b;font-style:italic;">${p.technologies}</p>`:''}</div></div>`).join('')):''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:8px;padding-top:20px;border-top:1px solid #e2e8f0;">
      ${cv.skills?.length?`<div><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#1d3461;margin:0 0 10px 0;">Compétences clés</p><div style="display:flex;flex-wrap:wrap;gap:6px;">${cv.skills.map(s=>`<span style="background:#eff6ff;color:#1d3461;border:1px solid #bfdbfe;font-size:8.5pt;padding:3px 10px;border-radius:3px;">${s}</span>`).join('')}</div></div>`:''}
      <div>
        ${cv.languages?.length?`<p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#1d3461;margin:0 0 6px 0;">Langues</p>${cv.languages.map(l=>`<p style="margin:2px 0;font-size:9.5pt;">${l.language} <span style="color:#64748b;">— ${l.level}</span></p>`).join('')}`:''}
        ${cv.certifications?.length?`<p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#1d3461;margin:10px 0 6px 0;">Certifications</p>${cv.certifications.map(c=>`<p style="margin:2px 0;font-size:9.5pt;"><strong>${c.name}</strong>${c.issuer?`<span style="color:#64748b;"> · ${c.issuer}</span>`:''}</p>`).join('')}`:''}
      </div>
    </div>
    ${cv.interests?.length?`<div style="margin-top:14px;padding-top:12px;border-top:1px solid #e2e8f0;"><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#1d3461;margin:0 0 6px 0;">Centres d'intérêt</p><p style="color:#475569;font-size:9.5pt;">${cv.interests.join(' · ')}</p></div>`:''}
  </div>
</div>`;
}
function exs(t:string,c:string){return `<div style="margin-bottom:26px;"><h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#1d3461;margin:0 0 14px 0;padding-bottom:6px;border-bottom:2px solid #1d3461;">${t}</h2>${c}</div>`;}

// ─── CRÉATIF ──────────────────────────────────────────────────────────────────
function buildCreativeHtml(cv: CVData): string {
  return `<div style="font-family:'Trebuchet MS',Verdana,sans-serif;background:white;max-width:794px;margin:0 auto;font-size:10pt;line-height:1.5;color:#1e1b4b;">
  <div style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 100%);padding:36px 44px;color:white;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.07);"></div>
    <div style="position:absolute;bottom:-20px;left:30%;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
    <h1 style="font-size:28pt;font-weight:900;margin:0 0 6px 0;letter-spacing:-1px;color:white;">${cv.fullName}</h1>
    <p style="font-size:11pt;font-weight:500;color:rgba(255,255,255,0.85);margin:0 0 18px 0;">${cv.title}</p>
    <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:8.5pt;color:rgba(255,255,255,0.8);">
      ${cv.contact?.email?`<span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;">✉ ${cv.contact.email}</span>`:''}
      ${cv.contact?.phone?`<span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;">✆ ${cv.contact.phone}</span>`:''}
      ${cv.contact?.location?`<span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;">📍 ${cv.contact.location}</span>`:''}
      ${cv.contact?.linkedin?`<span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;">🔗 ${cv.contact.linkedin}</span>`:''}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 240px;gap:0;background:white;">
    <div style="padding:28px 28px 28px 44px;">
      ${cv.professionalSummary?`<div style="margin-bottom:22px;"><div style="height:3px;background:linear-gradient(90deg,#7c3aed,#db2777);margin-bottom:12px;border-radius:2px;width:40px;"></div><p style="color:#374151;line-height:1.7;font-size:10pt;margin:0;">${cv.professionalSummary}</p></div>`:''}
      ${cv.experiences?.length?crs('Expériences',cv.experiences.map(e=>`<div style="margin-bottom:18px;position:relative;padding-left:14px;border-left:3px solid #e5e7eb;"><div style="position:absolute;left:-7px;top:3px;width:11px;height:11px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#db2777);"></div><div style="display:flex;justify-content:space-between;"><div><strong style="color:#111827;font-size:10.5pt;">${e.position}</strong><br><span style="color:#7c3aed;font-size:9.5pt;font-weight:600;">${e.company}</span></div><span style="font-size:8pt;color:#9ca3af;white-space:nowrap;margin-left:8px;background:#f3f4f6;padding:2px 8px;border-radius:10px;">${e.dates}</span></div><ul style="margin:6px 0 0 0;padding-left:14px;">${e.bullets?.map(b=>`<li style="font-size:9.5pt;color:#4b5563;margin-bottom:3px;">${b}</li>`).join('')||''}</ul></div>`).join('')):''}
      ${cv.projects?.length?crs('Projets',cv.projects.map(p=>`<div style="margin-bottom:12px;background:#faf5ff;border-radius:8px;padding:12px;border:1px solid #e9d5ff;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong style="color:#7c3aed;">${p.name}</strong>${p.dates?`<span style="font-size:8pt;color:#9ca3af;">${p.dates}</span>`:''}</div><p style="margin:0 0 4px 0;font-size:9.5pt;color:#4b5563;">${p.description}</p>${p.technologies?`<p style="margin:0;font-size:8.5pt;color:#db2777;font-style:italic;">${p.technologies}</p>`:''}</div>`).join('')):''}
    </div>
    <div style="background:#faf5ff;padding:28px 20px;border-left:1px solid #e9d5ff;">
      ${cv.skills?.length?crss('Compétences',cv.skills.map(s=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><div style="width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#db2777);flex-shrink:0;"></div><span style="font-size:9pt;color:#374151;">${s}</span></div>`).join('')):''}
      ${cv.education?.length?crss('Formation',cv.education.map(e=>`<div style="margin-bottom:10px;"><p style="font-weight:700;font-size:9.5pt;margin:0;color:#1e1b4b;">${e.degree}</p><p style="font-size:8.5pt;color:#7c3aed;margin:1px 0;">${e.school}</p><p style="font-size:8pt;color:#9ca3af;margin:0;">${e.dates}</p></div>`).join('')):''}
      ${cv.languages?.length?crss('Langues',cv.languages.map(l=>`<p style="margin:3px 0;font-size:9pt;color:#374151;"><strong>${l.language}</strong> <span style="color:#9ca3af;">— ${l.level}</span></p>`).join('')):''}
      ${cv.certifications?.length?crss('Certifications',cv.certifications.map(c=>`<p style="margin:3px 0;font-size:9pt;color:#374151;font-weight:600;">${c.name}${c.issuer?`<span style="font-weight:normal;color:#9ca3af;"> · ${c.issuer}</span>`:''}</p>`).join('')):''}
      ${cv.interests?.length?crss("Centres d'intérêt",`<p style="font-size:9pt;color:#374151;">${cv.interests.join(' · ')}</p>`):''}
    </div>
  </div>
</div>`;
}
function crs(t:string,c:string){return `<div style="margin-bottom:22px;"><div style="height:3px;background:linear-gradient(90deg,#7c3aed,#db2777);margin-bottom:10px;border-radius:2px;width:40px;"></div><h2 style="font-size:8.5pt;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:#1e1b4b;margin:0 0 12px 0;">${t}</h2>${c}</div>`;}
function crss(t:string,c:string){return `<div style="margin-bottom:18px;"><p style="font-size:8pt;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:#7c3aed;margin:0 0 8px 0;padding-bottom:4px;border-bottom:1px solid #e9d5ff;">${t}</p>${c}</div>`;}

// ─── TECH ─────────────────────────────────────────────────────────────────────
function buildTechHtml(cv: CVData): string {
  return `<div style="font-family:'Courier New',Courier,monospace;background:white;max-width:794px;margin:0 auto;font-size:9.5pt;line-height:1.55;color:#1a1a1a;">
  <div style="background:#0f172a;color:#e2e8f0;padding:28px 36px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <div style="font-size:10pt;color:#059669;margin-bottom:6px;">$ whoami</div>
      <h1 style="font-size:22pt;font-weight:bold;margin:0;color:white;letter-spacing:1px;">${cv.fullName}</h1>
      <p style="font-size:10pt;color:#34d399;margin:4px 0 0 0;"># ${cv.title}</p>
    </div>
    <div style="text-align:right;font-size:8.5pt;color:#94a3b8;line-height:1.8;">
      ${cv.contact?.email?`<div>→ ${cv.contact.email}</div>`:''}
      ${cv.contact?.phone?`<div>→ ${cv.contact.phone}</div>`:''}
      ${cv.contact?.location?`<div>→ ${cv.contact.location}</div>`:''}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 220px;">
    <div style="padding:24px 28px;border-right:1px solid #e2e8f0;">
      ${cv.professionalSummary?`<div style="margin-bottom:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:12px 14px;"><span style="color:#059669;font-weight:bold;">/* </span><span style="color:#374151;font-size:9.5pt;">${cv.professionalSummary}</span><span style="color:#059669;font-weight:bold;"> */</span></div>`:''}
      ${cv.experiences?.length?tecs('experience[]',cv.experiences.map((e,i)=>`<div style="margin-bottom:18px;padding-left:14px;border-left:2px solid #059669;"><div style="display:flex;justify-content:space-between;"><div><span style="color:#059669;font-size:8.5pt;">[${i}]</span> <strong style="color:#0f172a;">${e.position}</strong> <span style="color:#64748b;">@ ${e.company}</span></div><span style="font-size:8pt;color:#94a3b8;background:#f8fafc;padding:1px 6px;border-radius:3px;">${e.dates}</span></div><ul style="margin:6px 0 0 0;padding-left:14px;">${e.bullets?.map(b=>`<li style="margin-bottom:3px;color:#374151;font-size:9.5pt;">${b}</li>`).join('')||''}</ul></div>`).join('')):''}
      ${cv.projects?.length?tecs('projects[]',cv.projects.map((p,i)=>`<div style="margin-bottom:12px;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;border-left:3px solid #059669;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#059669;font-size:8.5pt;">[${i}]</span> <strong style="color:#0f172a;">${p.name}</strong>${p.dates?`<span style="font-size:8pt;color:#94a3b8;">${p.dates}</span>`:''}</div><p style="margin:0 0 4px 0;color:#374151;font-size:9.5pt;">${p.description}</p>${p.technologies?`<p style="margin:0;font-size:8.5pt;color:#059669;font-style:italic;">${p.technologies}</p>`:''}</div>`).join('')):''}
    </div>
    <div style="padding:24px 20px;background:#f8fafc;">
      ${cv.skills?.length?tess('skills[]',`<div style="display:flex;flex-wrap:wrap;gap:4px;">${cv.skills.map(s=>`<span style="background:#dcfce7;color:#065f46;font-size:8pt;padding:2px 8px;border-radius:3px;border:1px solid #bbf7d0;">${s}</span>`).join('')}</div>`):''}
      ${cv.education?.length?tess('education[]',cv.education.map((e,i)=>`<div style="margin-bottom:8px;"><div style="color:#059669;font-size:8pt;">[${i}]</div><p style="font-weight:700;margin:0;font-size:9pt;color:#0f172a;">${e.degree}</p><p style="font-size:8.5pt;color:#64748b;margin:1px 0;">${e.school}</p><p style="font-size:8pt;color:#94a3b8;margin:0;">${e.dates}</p></div>`).join('')):''}
      ${cv.languages?.length?tess('languages[]',cv.languages.map((l,i)=>`<div style="font-size:9pt;margin-bottom:3px;"><span style="color:#059669;">[${i}]</span> <strong>${l.language}</strong> <span style="color:#64748b;">= "${l.level}"</span></div>`).join('')):''}
      ${cv.certifications?.length?tess('certs[]',cv.certifications.map((c,i)=>`<div style="font-size:9pt;margin-bottom:3px;"><span style="color:#059669;">[${i}]</span> <strong>${c.name}</strong>${c.issuer?`<span style="color:#64748b;font-size:8.5pt;"> · ${c.issuer}</span>`:''}</div>`).join('')):''}
      ${cv.interests?.length?tess('interests[]',`<p style="font-size:9pt;color:#374151;margin:0;">${cv.interests.join(', ')}</p>`):''}
    </div>
  </div>
</div>`;
}
function tecs(t:string,c:string){return `<div style="margin-bottom:20px;"><div style="font-size:8.5pt;font-weight:bold;color:#059669;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">.${t} {</div>${c}<div style="font-size:8.5pt;color:#059669;">}</div></div>`;}
function tess(t:string,c:string){return `<div style="margin-bottom:14px;"><p style="font-size:8pt;font-weight:bold;color:#059669;margin:0 0 6px 0;">.${t}</p>${c}</div>`;}

// ─── React wrappers ───────────────────────────────────────────────────────────
export function TemplateClassic({ cv }: { cv: CVData }) { return <div dangerouslySetInnerHTML={{ __html: buildClassicHtml(cv) }} />; }
export function TemplateModern({ cv }: { cv: CVData }) { return <div dangerouslySetInnerHTML={{ __html: buildModernHtml(cv) }} />; }
export function TemplateMinimal({ cv }: { cv: CVData }) { return <div dangerouslySetInnerHTML={{ __html: buildMinimalHtml(cv) }} />; }
export function TemplateExecutive({ cv }: { cv: CVData }) { return <div dangerouslySetInnerHTML={{ __html: buildExecutiveHtml(cv) }} />; }
export function TemplateCreative({ cv }: { cv: CVData }) { return <div dangerouslySetInnerHTML={{ __html: buildCreativeHtml(cv) }} />; }
export function TemplateTech({ cv }: { cv: CVData }) { return <div dangerouslySetInnerHTML={{ __html: buildTechHtml(cv) }} />; }