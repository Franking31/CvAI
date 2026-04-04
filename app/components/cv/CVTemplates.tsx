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

export type CVStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  marginH: number;
  marginV: number;
  accentColor: string;
  textColor: string;
  sectionSpacing: number;
};

export const DEFAULT_CV_STYLE: CVStyle = {
  fontFamily: 'default',
  fontSize: 10,
  lineHeight: 1.45,
  marginH: 32,
  marginV: 24,
  accentColor: '',
  textColor: '',
  sectionSpacing: 12,
};

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'creative' | 'tech';

export const TEMPLATES: { id: TemplateId; label: string; description: string; accent: string }[] = [
  { id: 'classic',   label: 'Classique',   description: 'Sérieux, serif, idéal RH/finance',    accent: '#1e293b' },
  { id: 'modern',    label: 'Moderne',     description: 'Deux colonnes, épuré, tech/startup',   accent: '#3b82f6' },
  { id: 'minimal',   label: 'Minimaliste', description: 'Typographie soignée, création/design', accent: '#b45309' },
  { id: 'executive', label: 'Executive',   description: 'Prestige, bleu marine, top management',accent: '#1d3461' },
  { id: 'creative',  label: 'Créatif',     description: 'Graphique, couleur, marketing/UX',     accent: '#7c3aed' },
  { id: 'tech',      label: 'Tech',        description: 'Dark sidebar, monospace, dev/data',     accent: '#059669' },
];

export function buildCVHtml(cv: CVData, template: TemplateId, style?: Partial<CVStyle>): string {
  const s: CVStyle = { ...DEFAULT_CV_STYLE, ...style };
  switch (template) {
    case 'modern':    return buildModernHtml(cv, s);
    case 'minimal':   return buildMinimalHtml(cv, s);
    case 'executive': return buildExecutiveHtml(cv, s);
    case 'creative':  return buildCreativeHtml(cv, s);
    case 'tech':      return buildTechHtml(cv, s);
    default:          return buildClassicHtml(cv, s);
  }
}

// ─── helpers style ────────────────────────────────────────────────────────────
function ff(s: CVStyle, fallback: string) { return s.fontFamily === 'default' ? fallback : s.fontFamily; }
function ac(s: CVStyle, fallback: string) { return s.accentColor || fallback; }
function tc(s: CVStyle, fallback: string) { return s.textColor   || fallback; }

// ─── CLASSIQUE ────────────────────────────────────────────────────────────────
function buildClassicHtml(cv: CVData, s: CVStyle): string {
  const accent = ac(s, '#1e293b');
  const text   = tc(s, '#1e293b');
  const font   = ff(s, "Georgia,'Times New Roman',serif");
  const sp     = s.sectionSpacing;

  const cs = (t: string, c: string) =>
    `<div style="margin-bottom:${sp}px;">
      <h2 style="font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin:0 0 7px 0;">${t}</h2>
      ${c}
    </div>`;

  return `<div style="font-family:${font};color:${text};background:white;padding:${s.marginV}px ${s.marginH}px;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="border-bottom:2px solid ${accent};padding-bottom:10px;margin-bottom:${sp}px;">
    <h1 style="font-size:22pt;font-weight:bold;margin:0 0 2px 0;color:${accent};">${cv.fullName}</h1>
    <p style="font-size:11pt;color:#64748b;margin:0 0 6px 0;font-style:italic;">${cv.title}</p>
    <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:8.5pt;color:#64748b;">
      ${cv.contact?.email    ? `<span>✉ ${cv.contact.email}</span>`    : ''}
      ${cv.contact?.phone    ? `<span>✆ ${cv.contact.phone}</span>`    : ''}
      ${cv.contact?.location ? `<span>📍 ${cv.contact.location}</span>`: ''}
      ${cv.contact?.linkedin ? `<span>🔗 ${cv.contact.linkedin}</span>`: ''}
    </div>
  </div>
  ${cv.professionalSummary ? cs('Profil professionnel', `<p style="margin:0;color:#334155;font-size:${s.fontSize - 0.5}pt;line-height:${s.lineHeight};">${cv.professionalSummary}</p>`) : ''}
  ${cv.experiences?.length  ? cs('Expériences professionnelles', cv.experiences.map(e =>
    `<div style="margin-bottom:${Math.round(sp * 0.75)}px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span><strong style="color:${accent};">${e.position}</strong> <span style="color:#64748b;">· ${e.company}</span></span>
        <span style="font-size:8.5pt;color:#94a3b8;white-space:nowrap;">${e.dates}</span>
      </div>
      <ul style="margin:3px 0 0 0;padding-left:14px;">
        ${e.bullets?.map(b => `<li style="margin-bottom:2px;color:#334155;font-size:${s.fontSize - 0.5}pt;">${b}</li>`).join('') || ''}
      </ul>
    </div>`).join('')) : ''}
  ${cv.projects?.length ? cs('Projets notables', cv.projects.map(p =>
    `<div style="margin-bottom:${Math.round(sp * 0.6)}px;">
      <div style="display:flex;justify-content:space-between;">
        <strong style="font-size:${s.fontSize - 0.5}pt;color:${accent};">${p.name}</strong>
        ${p.dates ? `<span style="font-size:8.5pt;color:#94a3b8;">${p.dates}</span>` : ''}
      </div>
      <p style="margin:2px 0;color:#334155;font-size:${s.fontSize - 0.5}pt;">${p.description}</p>
      ${p.technologies ? `<p style="margin:1px 0;font-size:8.5pt;color:#64748b;font-style:italic;">${p.technologies}</p>` : ''}
    </div>`).join('')) : ''}
  ${cv.skills?.length    ? cs('Compétences', `<p style="margin:0;color:#334155;font-size:${s.fontSize - 0.5}pt;">${cv.skills.join(' · ')}</p>`) : ''}
  ${cv.education?.length ? cs('Formation', cv.education.map(e =>
    `<div style="display:flex;justify-content:space-between;margin-bottom:4px;">
      <span><strong style="font-size:${s.fontSize - 0.5}pt;">${e.degree}</strong> <span style="color:#64748b;font-size:${s.fontSize - 1}pt;">· ${e.school}</span></span>
      <span style="font-size:8.5pt;color:#94a3b8;">${e.dates}</span>
    </div>`).join('')) : ''}
  ${cv.languages?.length || cv.certifications?.length || cv.interests?.length ? `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:4px;padding-top:${Math.round(sp * 0.5)}px;border-top:1px solid #e2e8f0;">
    ${cv.languages?.length ? `<div>
      <p style="font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:${accent};margin:0 0 4px 0;">Langues</p>
      ${cv.languages.map(l => `<p style="margin:1px 0;font-size:${s.fontSize - 0.5}pt;">${l.language} <span style="color:#64748b;">— ${l.level}</span></p>`).join('')}
    </div>` : '<div></div>'}
    ${cv.certifications?.length ? `<div>
      <p style="font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:${accent};margin:0 0 4px 0;">Certifications</p>
      ${cv.certifications.map(c => `<p style="margin:1px 0;font-size:${s.fontSize - 0.5}pt;font-weight:600;">${c.name}${c.issuer ? `<span style="font-weight:normal;color:#64748b;"> · ${c.issuer}</span>` : ''}</p>`).join('')}
    </div>` : '<div></div>'}
    ${cv.interests?.length ? `<div>
      <p style="font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:${accent};margin:0 0 4px 0;">Centres d'intérêt</p>
      <p style="margin:0;color:#334155;font-size:${s.fontSize - 0.5}pt;">${cv.interests.join(' · ')}</p>
    </div>` : '<div></div>'}
  </div>` : ''}
</div>`;
}

// ─── MODERNE ──────────────────────────────────────────────────────────────────
function buildModernHtml(cv: CVData, s: CVStyle): string {
  const accent = ac(s, '#3b82f6');
  const font   = ff(s, "'Helvetica Neue',Arial,sans-serif");
  const sp     = s.sectionSpacing;

  const mss = (t: string, c: string) =>
    `<div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:${Math.round(sp)}px;margin-top:${Math.round(sp)}px;">
      <p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#93c5fd;margin:0 0 8px 0;">${t}</p>
      ${c}
    </div>`;

  const mms = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 8}px;">
      <h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin:0 0 10px 0;display:flex;align-items:center;gap:8px;">
        <span style="flex:1;height:1px;background:#e2e8f0;display:inline-block;"></span>${t}<span style="flex:1;height:1px;background:#e2e8f0;display:inline-block;"></span>
      </h2>${c}
    </div>`;

  return `<div style="font-family:${font};background:white;display:flex;width:794px;min-height:1123px;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="width:255px;background:#1e293b;color:white;padding:${s.marginV}px ${Math.round(s.marginH * 0.65)}px;flex-shrink:0;">
    <h1 style="font-size:17pt;font-weight:bold;margin:0 0 5px 0;line-height:1.2;color:white;">${cv.fullName}</h1>
    <p style="font-size:9.5pt;color:#93c5fd;margin:0 0 ${sp}px 0;font-weight:500;">${cv.title}</p>
    ${mss('Contact', `
      ${cv.contact?.email    ? `<div style="margin-bottom:5px;font-size:8.5pt;color:#cbd5e1;word-break:break-all;">✉ ${cv.contact.email}</div>` : ''}
      ${cv.contact?.phone    ? `<div style="margin-bottom:5px;font-size:8.5pt;color:#cbd5e1;">✆ ${cv.contact.phone}</div>` : ''}
      ${cv.contact?.location ? `<div style="font-size:8.5pt;color:#cbd5e1;">📍 ${cv.contact.location}</div>` : ''}
    `)}
    ${cv.skills?.length ? mss('Compétences', cv.skills.map(sk =>
      `<span style="display:inline-block;background:rgba(255,255,255,0.1);color:#e2e8f0;font-size:8pt;padding:2px 7px;border-radius:4px;margin:2px 2px 2px 0;">${sk}</span>`
    ).join('')) : ''}
    ${cv.languages?.length ? mss('Langues', cv.languages.map(l =>
      `<p style="margin:2px 0;font-size:8.5pt;color:#cbd5e1;"><strong style="color:white;">${l.language}</strong> — ${l.level}</p>`
    ).join('')) : ''}
    ${cv.certifications?.length ? mss('Certifications', cv.certifications.map(c =>
      `<p style="margin:2px 0;font-size:8.5pt;font-weight:600;color:white;">${c.name}${c.issuer ? `<span style="font-weight:normal;color:#94a3b8;"> · ${c.issuer}</span>` : ''}</p>`
    ).join('')) : ''}
    ${cv.education?.length ? mss('Formation', cv.education.map(e =>
      `<div style="margin-bottom:8px;"><p style="font-weight:600;font-size:9pt;color:white;margin:0;">${e.degree}</p><p style="font-size:8.5pt;color:#94a3b8;margin:1px 0;">${e.school}</p><p style="font-size:8pt;color:#64748b;margin:0;">${e.dates}</p></div>`
    ).join('')) : ''}
    ${cv.interests?.length ? mss("Centres d'intérêt", `<p style="font-size:8.5pt;color:#cbd5e1;margin:0;">${cv.interests.join(' · ')}</p>`) : ''}
  </div>
  <div style="flex:1;padding:${s.marginV}px ${Math.round(s.marginH * 0.75)}px;background:white;">
    ${cv.professionalSummary ? mms('À propos', `<p style="color:#475569;font-size:${s.fontSize - 0.5}pt;line-height:${s.lineHeight};margin:0;">${cv.professionalSummary}</p>`) : ''}
    ${cv.experiences?.length ? mms('Expériences', cv.experiences.map(e =>
      `<div style="padding-left:14px;border-left:2px solid #bfdbfe;margin-bottom:${sp}px;position:relative;">
        <div style="width:8px;height:8px;border-radius:50%;background:${accent};position:absolute;left:-5px;top:4px;"></div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
          <div><strong style="font-size:${s.fontSize}pt;color:#0f172a;">${e.position}</strong><br><span style="color:${accent};font-size:${s.fontSize - 1}pt;">${e.company}</span></div>
          <span style="font-size:8pt;color:#94a3b8;white-space:nowrap;margin-left:8px;">${e.dates}</span>
        </div>
        <ul style="margin:4px 0 0 0;padding-left:14px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 0.5}pt;color:#475569;margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
      </div>`).join('')) : ''}
    ${cv.projects?.length ? mms('Projets', cv.projects.map(p =>
      `<div style="border:1px solid #e2e8f0;border-radius:6px;padding:10px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <strong style="font-size:${s.fontSize}pt;color:#0f172a;">${p.name}</strong>
          ${p.dates ? `<span style="font-size:8pt;color:#94a3b8;">${p.dates}</span>` : ''}
        </div>
        <p style="margin:0 0 4px 0;font-size:${s.fontSize - 0.5}pt;color:#475569;">${p.description}</p>
        ${p.technologies ? `<p style="margin:0;font-size:8pt;color:${accent};font-style:italic;">${p.technologies}</p>` : ''}
      </div>`).join('')) : ''}
  </div>
</div>`;
}

// ─── MINIMALISTE ──────────────────────────────────────────────────────────────
function buildMinimalHtml(cv: CVData, s: CVStyle): string {
  const accent = ac(s, '#b45309');
  const text   = tc(s, '#292524');
  const font   = ff(s, "'Palatino Linotype',Palatino,serif");
  const sp     = s.sectionSpacing;

  const mins = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${accent};margin:0 0 8px 0;">${t}</h2>
      ${c}
    </div>`;

  return `<div style="font-family:${font};color:${text};background:white;padding:${s.marginV + 8}px ${s.marginH + 8}px;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="margin-bottom:${sp + 6}px;border-bottom:1px solid #e7e5e4;padding-bottom:14px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <h1 style="font-size:24pt;font-weight:normal;margin:0;color:#1c1917;letter-spacing:-0.5px;">${cv.fullName}</h1>
      <p style="font-size:8pt;text-transform:uppercase;letter-spacing:0.2em;color:${accent};margin:6px 0 0 0;">${cv.title}</p>
    </div>
    <div style="text-align:right;font-size:8pt;color:#78716c;line-height:1.8;">
      ${cv.contact?.email    ? `<div>${cv.contact.email}</div>`    : ''}
      ${cv.contact?.phone    ? `<div>${cv.contact.phone}</div>`    : ''}
      ${cv.contact?.location ? `<div>${cv.contact.location}</div>` : ''}
    </div>
  </div>
  ${cv.professionalSummary ? `<div style="margin-bottom:${sp + 4}px;border-left:2px solid ${accent};padding-left:12px;"><p style="margin:0;color:#57534e;font-style:italic;font-size:${s.fontSize - 0.5}pt;">${cv.professionalSummary}</p></div>` : ''}
  ${cv.experiences?.length ? mins('Expériences', cv.experiences.map(e =>
    `<div style="margin-bottom:${sp}px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
        <span><strong>${e.position}</strong> <span style="color:#78716c;">@ ${e.company}</span></span>
        <span style="font-size:8.5pt;color:#a8a29e;">${e.dates}</span>
      </div>
      <ul style="margin:0;padding-left:14px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 0.5}pt;color:#57534e;margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
    </div>`).join('')) : ''}
  ${cv.projects?.length ? mins('Projets notables', cv.projects.map(p =>
    `<div style="margin-bottom:${Math.round(sp * 0.8)}px;">
      <div style="display:flex;justify-content:space-between;">
        <strong>${p.name}</strong>
        ${p.dates ? `<span style="font-size:8.5pt;color:#a8a29e;">${p.dates}</span>` : ''}
      </div>
      <p style="margin:2px 0;color:#57534e;font-size:${s.fontSize - 0.5}pt;">${p.description}</p>
      ${p.technologies ? `<p style="margin:0;font-size:8.5pt;color:${accent};font-style:italic;">${p.technologies}</p>` : ''}
    </div>`).join('')) : ''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:${sp}px;">
    ${cv.skills?.length ? `<div>
      <p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 5px 0;">Compétences</p>
      <p style="color:#57534e;font-size:${s.fontSize - 0.5}pt;">${cv.skills.join(' · ')}</p>
    </div>` : ''}
    ${cv.education?.length ? `<div>
      <p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 5px 0;">Formation</p>
      ${cv.education.map(e => `<div style="margin-bottom:5px;"><p style="font-weight:600;margin:0;font-size:${s.fontSize - 0.5}pt;">${e.degree}</p><p style="color:#78716c;margin:1px 0;font-size:${s.fontSize - 1}pt;">${e.school} · ${e.dates}</p></div>`).join('')}
    </div>` : ''}
  </div>
  ${cv.languages?.length || cv.certifications?.length || cv.interests?.length ? `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding-top:${Math.round(sp * 0.8)}px;border-top:1px solid #e7e5e4;">
    ${cv.languages?.length ? `<div>
      <p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 4px 0;">Langues</p>
      ${cv.languages.map(l => `<p style="margin:1px 0;font-size:${s.fontSize - 0.5}pt;">${l.language} <span style="color:#78716c;">— ${l.level}</span></p>`).join('')}
    </div>` : '<div></div>'}
    ${cv.certifications?.length ? `<div>
      <p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 4px 0;">Certifications</p>
      ${cv.certifications.map(c => `<p style="margin:1px 0;font-size:${s.fontSize - 0.5}pt;font-weight:600;">${c.name}${c.issuer ? `<span style="font-weight:normal;color:#78716c;"> · ${c.issuer}</span>` : ''}</p>`).join('')}
    </div>` : '<div></div>'}
    ${cv.interests?.length ? `<div>
      <p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 4px 0;">Centres d'intérêt</p>
      <p style="color:#57534e;font-size:${s.fontSize - 0.5}pt;margin:0;">${cv.interests.join(' · ')}</p>
    </div>` : '<div></div>'}
  </div>` : ''}
</div>`;
}

// ─── EXECUTIVE ────────────────────────────────────────────────────────────────
function buildExecutiveHtml(cv: CVData, s: CVStyle): string {
  const accent = ac(s, '#1d3461');
  const font   = ff(s, "'Garamond','EB Garamond',Georgia,serif");
  const sp     = s.sectionSpacing;

  const exs = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 8}px;">
      <h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${accent};margin:0 0 10px 0;padding-bottom:5px;border-bottom:2px solid ${accent};">${t}</h2>
      ${c}
    </div>`;

  return `<div style="font-family:${font};color:#1a1a2e;background:white;padding:0;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="background:${accent};color:white;padding:${s.marginV + 4}px ${s.marginH + 8}px ${s.marginV}px;">
    <div style="border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:14px;margin-bottom:14px;">
      <h1 style="font-size:26pt;font-weight:normal;margin:0;letter-spacing:1px;color:white;">${cv.fullName}</h1>
      <p style="color:#93c5fd;margin:5px 0 0 0;letter-spacing:3px;text-transform:uppercase;font-size:8.5pt;">${cv.title}</p>
    </div>
    <div style="display:flex;gap:24px;font-size:8.5pt;color:rgba(255,255,255,0.75);">
      ${cv.contact?.email    ? `<span>✉ ${cv.contact.email}</span>`    : ''}
      ${cv.contact?.phone    ? `<span>✆ ${cv.contact.phone}</span>`    : ''}
      ${cv.contact?.location ? `<span>📍 ${cv.contact.location}</span>`: ''}
      ${cv.contact?.linkedin ? `<span>🔗 ${cv.contact.linkedin}</span>`: ''}
    </div>
  </div>
  <div style="padding:${s.marginV + 4}px ${s.marginH + 8}px;">
    ${cv.professionalSummary ? `<div style="background:#f0f4ff;border-left:4px solid ${accent};padding:14px 18px;margin-bottom:${sp + 10}px;"><p style="margin:0;font-style:italic;color:#1e3a5f;font-size:${s.fontSize}pt;line-height:${s.lineHeight + 0.1};">${cv.professionalSummary}</p></div>` : ''}
    ${cv.experiences?.length ? exs('Parcours professionnel', cv.experiences.map(e =>
      `<div style="margin-bottom:${sp + 4}px;display:grid;grid-template-columns:150px 1fr;gap:14px;">
        <div style="text-align:right;">
          <p style="font-size:8pt;color:#94a3b8;margin:0;white-space:nowrap;">${e.dates}</p>
          <p style="font-size:8.5pt;color:${accent};font-weight:600;margin:3px 0 0 0;">${e.company}</p>
        </div>
        <div style="border-left:1px solid #e2e8f0;padding-left:14px;">
          <p style="font-weight:700;font-size:${s.fontSize}pt;margin:0 0 5px 0;color:#1a1a2e;">${e.position}</p>
          <ul style="margin:0;padding-left:12px;">${e.bullets?.map(b => `<li style="margin-bottom:3px;color:#334155;font-size:${s.fontSize - 0.5}pt;">${b}</li>`).join('') || ''}</ul>
        </div>
      </div>`).join('')) : ''}
    ${cv.education?.length ? exs('Formation', cv.education.map(e =>
      `<div style="display:grid;grid-template-columns:150px 1fr;gap:14px;margin-bottom:8px;">
        <div style="text-align:right;font-size:8pt;color:#94a3b8;">${e.dates}</div>
        <div style="border-left:1px solid #e2e8f0;padding-left:14px;">
          <strong>${e.degree}</strong><span style="color:#64748b;"> — ${e.school}</span>
        </div>
      </div>`).join('')) : ''}
    ${cv.projects?.length ? exs('Projets stratégiques', cv.projects.map(p =>
      `<div style="margin-bottom:${sp}px;display:grid;grid-template-columns:150px 1fr;gap:14px;">
        <div style="text-align:right;font-size:8pt;color:#94a3b8;">${p.dates || ''}</div>
        <div style="border-left:1px solid #e2e8f0;padding-left:14px;">
          <strong style="color:${accent};">${p.name}</strong>
          <p style="margin:3px 0;color:#334155;font-size:${s.fontSize - 0.5}pt;">${p.description}</p>
          ${p.technologies ? `<p style="margin:0;font-size:8pt;color:#64748b;font-style:italic;">${p.technologies}</p>` : ''}
        </div>
      </div>`).join('')) : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding-top:${sp}px;border-top:1px solid #e2e8f0;">
      ${cv.skills?.length ? `<div>
        <p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 8px 0;">Compétences clés</p>
        <div style="display:flex;flex-wrap:wrap;gap:5px;">${cv.skills.map(sk => `<span style="background:#eff6ff;color:${accent};border:1px solid #bfdbfe;font-size:8pt;padding:2px 9px;border-radius:3px;">${sk}</span>`).join('')}</div>
      </div>` : ''}
      <div>
        ${cv.languages?.length ? `<p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 5px 0;">Langues</p>${cv.languages.map(l => `<p style="margin:1px 0;font-size:${s.fontSize - 0.5}pt;">${l.language} <span style="color:#64748b;">— ${l.level}</span></p>`).join('')}` : ''}
        ${cv.certifications?.length ? `<p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:8px 0 5px 0;">Certifications</p>${cv.certifications.map(c => `<p style="margin:1px 0;font-size:${s.fontSize - 0.5}pt;"><strong>${c.name}</strong>${c.issuer ? `<span style="color:#64748b;"> · ${c.issuer}</span>` : ''}</p>`).join('')}` : ''}
      </div>
    </div>
    ${cv.interests?.length ? `<div style="margin-top:${sp}px;padding-top:10px;border-top:1px solid #e2e8f0;"><p style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 4px 0;">Centres d'intérêt</p><p style="color:#475569;font-size:${s.fontSize - 0.5}pt;">${cv.interests.join(' · ')}</p></div>` : ''}
  </div>
</div>`;
}

// ─── CRÉATIF ──────────────────────────────────────────────────────────────────
function buildCreativeHtml(cv: CVData, s: CVStyle): string {
  const accent  = ac(s, '#7c3aed');
  const accent2 = s.accentColor ? s.accentColor : '#db2777';
  const font    = ff(s, "'Trebuchet MS',Verdana,sans-serif");
  const sp      = s.sectionSpacing;

  const crs = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 6}px;">
      <div style="height:3px;background:linear-gradient(90deg,${accent},${accent2});margin-bottom:8px;border-radius:2px;width:36px;"></div>
      <h2 style="font-size:8pt;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:#1e1b4b;margin:0 0 10px 0;">${t}</h2>
      ${c}
    </div>`;

  const crss = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 2}px;">
      <p style="font-size:8pt;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 6px 0;padding-bottom:3px;border-bottom:1px solid #e9d5ff;">${t}</p>
      ${c}
    </div>`;

  return `<div style="font-family:${font};background:white;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};color:#1e1b4b;">
  <div style="background:linear-gradient(135deg,${accent} 0%,${accent2} 100%);padding:${s.marginV + 8}px ${s.marginH + 8}px;color:white;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-30px;right:-30px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,0.07);"></div>
    <h1 style="font-size:24pt;font-weight:900;margin:0 0 5px 0;letter-spacing:-1px;color:white;">${cv.fullName}</h1>
    <p style="font-size:10.5pt;font-weight:500;color:rgba(255,255,255,0.85);margin:0 0 14px 0;">${cv.title}</p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:8pt;color:rgba(255,255,255,0.8);">
      ${cv.contact?.email    ? `<span style="background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:20px;">✉ ${cv.contact.email}</span>`    : ''}
      ${cv.contact?.phone    ? `<span style="background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:20px;">✆ ${cv.contact.phone}</span>`    : ''}
      ${cv.contact?.location ? `<span style="background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:20px;">📍 ${cv.contact.location}</span>` : ''}
      ${cv.contact?.linkedin ? `<span style="background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:20px;">🔗 ${cv.contact.linkedin}</span>` : ''}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 230px;background:white;">
    <div style="padding:${s.marginV}px ${s.marginH}px ${s.marginV}px ${Math.round(s.marginH * 1.1)}px;">
      ${cv.professionalSummary ? `<div style="margin-bottom:${sp + 4}px;"><div style="height:3px;background:linear-gradient(90deg,${accent},${accent2});margin-bottom:10px;border-radius:2px;width:36px;"></div><p style="color:#374151;line-height:${s.lineHeight + 0.1};font-size:${s.fontSize - 0.5}pt;margin:0;">${cv.professionalSummary}</p></div>` : ''}
      ${cv.experiences?.length ? crs('Expériences', cv.experiences.map(e =>
        `<div style="margin-bottom:${sp + 2}px;position:relative;padding-left:12px;border-left:3px solid #e5e7eb;">
          <div style="position:absolute;left:-7px;top:3px;width:11px;height:11px;border-radius:50%;background:linear-gradient(135deg,${accent},${accent2});"></div>
          <div style="display:flex;justify-content:space-between;">
            <div>
              <strong style="color:#111827;font-size:${s.fontSize}pt;">${e.position}</strong><br>
              <span style="color:${accent};font-size:${s.fontSize - 1}pt;font-weight:600;">${e.company}</span>
            </div>
            <span style="font-size:8pt;color:#9ca3af;white-space:nowrap;margin-left:8px;background:#f3f4f6;padding:2px 7px;border-radius:10px;">${e.dates}</span>
          </div>
          <ul style="margin:4px 0 0 0;padding-left:12px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 0.5}pt;color:#4b5563;margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
        </div>`).join('')) : ''}
      ${cv.projects?.length ? crs('Projets', cv.projects.map(p =>
        `<div style="margin-bottom:8px;background:#faf5ff;border-radius:8px;padding:10px;border:1px solid #e9d5ff;">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <strong style="color:${accent};">${p.name}</strong>
            ${p.dates ? `<span style="font-size:8pt;color:#9ca3af;">${p.dates}</span>` : ''}
          </div>
          <p style="margin:0 0 3px 0;font-size:${s.fontSize - 0.5}pt;color:#4b5563;">${p.description}</p>
          ${p.technologies ? `<p style="margin:0;font-size:8pt;color:${accent2};font-style:italic;">${p.technologies}</p>` : ''}
        </div>`).join('')) : ''}
    </div>
    <div style="background:#faf5ff;padding:${s.marginV}px ${Math.round(s.marginH * 0.65)}px;border-left:1px solid #e9d5ff;">
      ${cv.skills?.length ? crss('Compétences', cv.skills.map(sk =>
        `<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">
          <div style="width:5px;height:5px;border-radius:50%;background:linear-gradient(135deg,${accent},${accent2});flex-shrink:0;"></div>
          <span style="font-size:${s.fontSize - 1}pt;color:#374151;">${sk}</span>
        </div>`).join('')) : ''}
      ${cv.education?.length ? crss('Formation', cv.education.map(e =>
        `<div style="margin-bottom:8px;"><p style="font-weight:700;font-size:${s.fontSize - 0.5}pt;margin:0;color:#1e1b4b;">${e.degree}</p><p style="font-size:8pt;color:${accent};margin:1px 0;">${e.school}</p><p style="font-size:7.5pt;color:#9ca3af;margin:0;">${e.dates}</p></div>`
      ).join('')) : ''}
      ${cv.languages?.length ? crss('Langues', cv.languages.map(l =>
        `<p style="margin:2px 0;font-size:${s.fontSize - 0.5}pt;color:#374151;"><strong>${l.language}</strong> <span style="color:#9ca3af;">— ${l.level}</span></p>`
      ).join('')) : ''}
      ${cv.certifications?.length ? crss('Certifications', cv.certifications.map(c =>
        `<p style="margin:2px 0;font-size:${s.fontSize - 0.5}pt;color:#374151;font-weight:600;">${c.name}${c.issuer ? `<span style="font-weight:normal;color:#9ca3af;"> · ${c.issuer}</span>` : ''}</p>`
      ).join('')) : ''}
      ${cv.interests?.length ? crss("Centres d'intérêt", `<p style="font-size:${s.fontSize - 0.5}pt;color:#374151;">${cv.interests.join(' · ')}</p>`) : ''}
    </div>
  </div>
</div>`;
}

// ─── TECH ─────────────────────────────────────────────────────────────────────
function buildTechHtml(cv: CVData, s: CVStyle): string {
  const accent = ac(s, '#059669');
  const font   = ff(s, "'Courier New',Courier,monospace");
  const sp     = s.sectionSpacing;

  const tecs = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <div style="font-size:8pt;font-weight:bold;color:${accent};margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:3px;">.${t} {</div>
      ${c}
      <div style="font-size:8pt;color:${accent};">}</div>
    </div>`;

  const tess = (t: string, c: string) =>
    `<div style="margin-bottom:${sp}px;">
      <p style="font-size:8pt;font-weight:bold;color:${accent};margin:0 0 5px 0;">.${t}</p>
      ${c}
    </div>`;

  return `<div style="font-family:${font};background:white;max-width:794px;margin:0 auto;font-size:${s.fontSize - 0.5}pt;line-height:${s.lineHeight};color:#1a1a1a;">
  <div style="background:#0f172a;color:#e2e8f0;padding:${s.marginV}px ${s.marginH}px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <div style="font-size:9.5pt;color:${accent};margin-bottom:5px;">$ whoami</div>
      <h1 style="font-size:20pt;font-weight:bold;margin:0;color:white;letter-spacing:1px;">${cv.fullName}</h1>
      <p style="font-size:9.5pt;color:#34d399;margin:3px 0 0 0;"># ${cv.title}</p>
    </div>
    <div style="text-align:right;font-size:8pt;color:#94a3b8;line-height:1.8;">
      ${cv.contact?.email    ? `<div>→ ${cv.contact.email}</div>`    : ''}
      ${cv.contact?.phone    ? `<div>→ ${cv.contact.phone}</div>`    : ''}
      ${cv.contact?.location ? `<div>→ ${cv.contact.location}</div>` : ''}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 215px;">
    <div style="padding:${s.marginV}px ${s.marginH}px;border-right:1px solid #e2e8f0;">
      ${cv.professionalSummary ? `<div style="margin-bottom:${sp + 4}px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:10px 12px;"><span style="color:${accent};font-weight:bold;">/* </span><span style="color:#374151;font-size:${s.fontSize - 0.5}pt;">${cv.professionalSummary}</span><span style="color:${accent};font-weight:bold;"> */</span></div>` : ''}
      ${cv.experiences?.length ? tecs('experience[]', cv.experiences.map((e, i) =>
        `<div style="margin-bottom:${sp}px;padding-left:12px;border-left:2px solid ${accent};">
          <div style="display:flex;justify-content:space-between;">
            <div><span style="color:${accent};font-size:8pt;">[${i}]</span> <strong style="color:#0f172a;">${e.position}</strong> <span style="color:#64748b;">@ ${e.company}</span></div>
            <span style="font-size:7.5pt;color:#94a3b8;background:#f8fafc;padding:1px 5px;border-radius:3px;">${e.dates}</span>
          </div>
          <ul style="margin:4px 0 0 0;padding-left:12px;">${e.bullets?.map(b => `<li style="margin-bottom:2px;color:#374151;font-size:${s.fontSize - 0.5}pt;">${b}</li>`).join('') || ''}</ul>
        </div>`).join('')) : ''}
      ${cv.projects?.length ? tecs('projects[]', cv.projects.map((p, i) =>
        `<div style="margin-bottom:8px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;border-left:3px solid ${accent};">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span><span style="color:${accent};font-size:8pt;">[${i}]</span> <strong style="color:#0f172a;">${p.name}</strong></span>
            ${p.dates ? `<span style="font-size:7.5pt;color:#94a3b8;">${p.dates}</span>` : ''}
          </div>
          <p style="margin:0 0 3px 0;color:#374151;font-size:${s.fontSize - 0.5}pt;">${p.description}</p>
          ${p.technologies ? `<p style="margin:0;font-size:8pt;color:${accent};font-style:italic;">${p.technologies}</p>` : ''}
        </div>`).join('')) : ''}
    </div>
    <div style="padding:${s.marginV}px ${Math.round(s.marginH * 0.6)}px;background:#f8fafc;">
      ${cv.skills?.length ? tess('skills[]', `<div style="display:flex;flex-wrap:wrap;gap:3px;">${cv.skills.map(sk => `<span style="background:#dcfce7;color:#065f46;font-size:7.5pt;padding:2px 7px;border-radius:3px;border:1px solid #bbf7d0;">${sk}</span>`).join('')}</div>`) : ''}
      ${cv.education?.length ? tess('education[]', cv.education.map((e, i) =>
        `<div style="margin-bottom:7px;"><div style="color:${accent};font-size:7.5pt;">[${i}]</div><p style="font-weight:700;margin:0;font-size:${s.fontSize - 0.5}pt;color:#0f172a;">${e.degree}</p><p style="font-size:8pt;color:#64748b;margin:1px 0;">${e.school}</p><p style="font-size:7.5pt;color:#94a3b8;margin:0;">${e.dates}</p></div>`
      ).join('')) : ''}
      ${cv.languages?.length ? tess('languages[]', cv.languages.map((l, i) =>
        `<div style="font-size:${s.fontSize - 0.5}pt;margin-bottom:2px;"><span style="color:${accent};">[${i}]</span> <strong>${l.language}</strong> <span style="color:#64748b;">= "${l.level}"</span></div>`
      ).join('')) : ''}
      ${cv.certifications?.length ? tess('certs[]', cv.certifications.map((c, i) =>
        `<div style="font-size:${s.fontSize - 0.5}pt;margin-bottom:2px;"><span style="color:${accent};">[${i}]</span> <strong>${c.name}</strong>${c.issuer ? `<span style="color:#64748b;font-size:8pt;"> · ${c.issuer}</span>` : ''}</div>`
      ).join('')) : ''}
      ${cv.interests?.length ? tess('interests[]', `<p style="font-size:${s.fontSize - 0.5}pt;color:#374151;margin:0;">${cv.interests.join(', ')}</p>`) : ''}
    </div>
  </div>
</div>`;
}

// ─── React wrappers ───────────────────────────────────────────────────────────
export function TemplateClassic({ cv }: { cv: CVData })   { return <div dangerouslySetInnerHTML={{ __html: buildClassicHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateModern({ cv }: { cv: CVData })    { return <div dangerouslySetInnerHTML={{ __html: buildModernHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateMinimal({ cv }: { cv: CVData })   { return <div dangerouslySetInnerHTML={{ __html: buildMinimalHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateExecutive({ cv }: { cv: CVData }) { return <div dangerouslySetInnerHTML={{ __html: buildExecutiveHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateCreative({ cv }: { cv: CVData })  { return <div dangerouslySetInnerHTML={{ __html: buildCreativeHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateTech({ cv }: { cv: CVData })      { return <div dangerouslySetInnerHTML={{ __html: buildTechHtml(cv, DEFAULT_CV_STYLE) }} />; }