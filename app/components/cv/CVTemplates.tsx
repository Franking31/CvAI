// app/components/cv/CVTemplates.tsx
'use client';

export type CVData = {
  fullName: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    socialLinks?: { label: string; url: string }[];
  };
  professionalSummary: string;
  experiences: { company: string; position: string; dates: string; bullets: string[] }[];
  skills: string[];
  education: { school: string; degree: string; dates: string }[];
  projects?: { name: string; description: string; technologies?: string; dates?: string; url?: string }[];
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

export type TemplateId = 
  | 'classic' | 'modern' | 'minimal' | 'executive' | 'creative'
  | 'darkgold' | 'photonoir' | 'editorial' | 'splitphoto' | 'gradientwarm' | 'corporateblue';

export const TEMPLATES: { id: TemplateId; label: string; description: string; accent: string }[] = [
  { id: 'classic',       label: 'Classique',      description: 'Sérieux, serif, idéal RH/finance',        accent: '#1e293b' },
  { id: 'modern',        label: 'Moderne',         description: 'Deux colonnes, épuré, tech/startup',      accent: '#3b82f6' },
  { id: 'minimal',       label: 'Minimaliste',     description: 'Typographie soignée, création/design',    accent: '#b45309' },
  { id: 'executive',     label: 'Executive',       description: 'Prestige, bleu marine, top management',   accent: '#1d3461' },
  { id: 'creative',      label: 'Créatif',         description: 'Graphique, couleur, marketing/UX',        accent: '#7c3aed' },
  { id: 'darkgold',      label: 'Dark Gold',       description: 'Sidebar sombre, avatar initiales, élégant', accent: '#c9a84c' },
  { id: 'photonoir',     label: 'Photo Noir',      description: 'Sidebar photo, élégant noir & blanc',     accent: '#1a1a1a' },
  { id: 'editorial',     label: 'Éditorial',       description: 'Grand titre, photo ronde, moderne graphique', accent: '#4a5240' },
  { id: 'splitphoto',    label: 'Split Photo',     description: 'Moitié photo, mise en page dynamique',    accent: '#0f172a' },
  { id: 'gradientwarm',  label: 'Gradient Warm',   description: 'Fond dégradé chaud, design audacieux',    accent: '#7c2d12' },
  { id: 'corporateblue', label: 'Corporate Blue',  description: 'Header bleu marine, sobre & professionnel', accent: '#1e3a5f' },
];

export function buildCVHtml(cv: CVData, template: TemplateId, style?: Partial<CVStyle>, photoDataUrl?: string): string {
  const s: CVStyle = { ...DEFAULT_CV_STYLE, ...style };
  switch (template) {
    case 'modern':        return buildModernHtml(cv, s, photoDataUrl);
    case 'minimal':       return buildMinimalHtml(cv, s, photoDataUrl);
    case 'executive':     return buildExecutiveHtml(cv, s, photoDataUrl);
    case 'creative':      return buildCreativeHtml(cv, s, photoDataUrl);
    case 'darkgold':      return buildDarkGoldHtml(cv, s, photoDataUrl);
    case 'photonoir':     return buildPhotoNoirHtml(cv, s, photoDataUrl);
    case 'editorial':     return buildEditorialHtml(cv, s, photoDataUrl);
    case 'splitphoto':    return buildSplitPhotoHtml(cv, s, photoDataUrl);
    case 'gradientwarm':  return buildGradientWarmHtml(cv, s, photoDataUrl);
    case 'corporateblue': return buildCorporateBlueHtml(cv, s, photoDataUrl);
    default:              return buildClassicHtml(cv, s, photoDataUrl);
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function ff(s: CVStyle, fallback: string) { return s.fontFamily === 'default' ? fallback : s.fontFamily; }
function ac(s: CVStyle, fallback: string) { return s.accentColor || fallback; }
function tc(s: CVStyle, fallback: string) { return s.textColor || fallback; }

/** Rendu de la photo — carré arrondi ou cercle selon le style */
function photoHtml(url: string | undefined, size: number, shape: 'circle' | 'rounded' = 'circle', border: string = 'none'): string {
  if (!url) return '';
  const radius = shape === 'circle' ? '50%' : '8px';
  return `<img src="${url}" alt="Photo de profil" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:${radius};border:${border};flex-shrink:0;" />`;
}

function buildSocialLinks(cv: CVData, color: string, bg = '', radius = '0'): string {
  const items: string[] = [];
  if (cv.contact?.linkedin)  items.push(`<a href="${cv.contact.linkedin}" style="color:${color};text-decoration:none;${bg ? `background:${bg};padding:3px 10px;border-radius:${radius};` : ''}">in ${shortenUrl(cv.contact.linkedin)}</a>`);
  if (cv.contact?.github)    items.push(`<a href="${cv.contact.github}"   style="color:${color};text-decoration:none;${bg ? `background:${bg};padding:3px 10px;border-radius:${radius};` : ''}">⌥ ${shortenUrl(cv.contact.github)}</a>`);
  if (cv.contact?.portfolio) items.push(`<a href="${cv.contact.portfolio}" style="color:${color};text-decoration:none;${bg ? `background:${bg};padding:3px 10px;border-radius:${radius};` : ''}">🌐 ${shortenUrl(cv.contact.portfolio)}</a>`);
  cv.contact?.socialLinks?.forEach(l => {
    if (l.url) items.push(`<a href="${l.url}" style="color:${color};text-decoration:none;${bg ? `background:${bg};padding:3px 10px;border-radius:${radius};` : ''}">🔗 ${l.label || shortenUrl(l.url)}</a>`);
  });
  return items.join('');
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/\/$/, '').replace(/^www\./, '');
  } catch {
    return url;
  }
}

function projectLink(url: string | undefined, accent: string): string {
  if (!url) return '';
  const shortened = shortenUrl(url);
  return `<div style="display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap;"><a href="${url}" style="display:inline-block;font-size:8pt;color:${accent};text-decoration:none;border:1px solid ${accent};border-radius:3px;padding:1px 7px;">🔗 Voir le projet</a><span style="font-size:7.5pt;color:#64748b;font-family:monospace;">${shortened}</span></div>`;
}

// ─── CLASSIQUE ────────────────────────────────────────────────────────────────
function buildClassicHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const accent = ac(s, '#1e293b');
  const text   = tc(s, '#1e293b');
  const font   = ff(s, "Georgia,'Times New Roman',serif");
  const sp     = s.sectionSpacing;

  const cs = (t: string, c: string) =>
    `<div style="margin-bottom:${sp}px;">
      <h2 style="font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin:0 0 7px 0;">${t}</h2>
      ${c}
    </div>`;

  const socialLine = buildSocialLinks(cv, '#64748b');

  return `<div style="font-family:${font};color:${text};background:white;padding:${s.marginV}px ${s.marginH}px;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="border-bottom:2px solid ${accent};padding-bottom:10px;margin-bottom:${sp}px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
    <div style="flex:1;">
      <h1 style="font-size:22pt;font-weight:bold;margin:0 0 2px 0;color:${accent};">${cv.fullName}</h1>
      <p style="font-size:11pt;color:#64748b;margin:0 0 6px 0;font-style:italic;">${cv.title}</p>
      <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:8.5pt;color:#64748b;">
        ${cv.contact?.email    ? `<span>✉ ${cv.contact.email}</span>` : ''}
        ${cv.contact?.phone    ? `<span>✆ ${cv.contact.phone}</span>` : ''}
        ${cv.contact?.location ? `<span>📍 ${cv.contact.location}</span>` : ''}
        ${socialLine}
      </div>
    </div>
    ${photo ? photoHtml(photo, 80, 'circle', `3px solid ${accent}`) : ''}
  </div>
  ${cv.professionalSummary ? cs('Profil professionnel', `<p style="margin:0;color:#334155;font-size:${s.fontSize - 0.5}pt;line-height:${s.lineHeight};">${cv.professionalSummary}</p>`) : ''}
  ${cv.experiences?.length ? cs('Expériences professionnelles', cv.experiences.map(e =>
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
      ${projectLink(p.url, accent)}
    </div>`).join('')) : ''}
  ${cv.skills?.length ? cs('Compétences', `<p style="margin:0;color:#334155;font-size:${s.fontSize - 0.5}pt;">${cv.skills.join(' · ')}</p>`) : ''}
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
function buildModernHtml(cv: CVData, s: CVStyle, photo?: string): string {
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

  const socialLinks = cv.contact?.linkedin || cv.contact?.github || cv.contact?.portfolio || cv.contact?.socialLinks?.length
    ? mss('Liens', buildSocialLinks(cv, '#93c5fd').split('</a>').filter(Boolean).map(l => `<div style="margin-bottom:4px;font-size:8.5pt;word-break:break-all;">${l}</a></div>`).join(''))
    : '';

  return `<div style="font-family:${font};background:white;display:flex;width:794px;min-height:1123px;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="width:255px;background:#1e293b;color:white;padding:${s.marginV}px ${Math.round(s.marginH * 0.65)}px;flex-shrink:0;">
    ${photo ? `<div style="margin-bottom:16px;display:flex;justify-content:center;">${photoHtml(photo, 90, 'circle', '3px solid rgba(255,255,255,0.3)')}</div>` : ''}
    <h1 style="font-size:17pt;font-weight:bold;margin:0 0 5px 0;line-height:1.2;color:white;">${cv.fullName}</h1>
    <p style="font-size:9.5pt;color:#93c5fd;margin:0 0 ${sp}px 0;font-weight:500;">${cv.title}</p>
    ${mss('Contact', `
      ${cv.contact?.email    ? `<div style="margin-bottom:5px;font-size:8.5pt;color:#cbd5e1;word-break:break-all;">✉ ${cv.contact.email}</div>` : ''}
      ${cv.contact?.phone    ? `<div style="margin-bottom:5px;font-size:8.5pt;color:#cbd5e1;">✆ ${cv.contact.phone}</div>` : ''}
      ${cv.contact?.location ? `<div style="font-size:8.5pt;color:#cbd5e1;">📍 ${cv.contact.location}</div>` : ''}
    `)}
    ${socialLinks}
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
        ${p.technologies ? `<p style="margin:0 0 4px 0;font-size:8pt;color:${accent};font-style:italic;">${p.technologies}</p>` : ''}
        ${projectLink(p.url, accent)}
      </div>`).join('')) : ''}
  </div>
</div>`;
}

// ─── MINIMALISTE ──────────────────────────────────────────────────────────────
function buildMinimalHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const accent = ac(s, '#b45309');
  const text   = tc(s, '#292524');
  const font   = ff(s, "'Palatino Linotype',Palatino,serif");
  const sp     = s.sectionSpacing;

  const mins = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${accent};margin:0 0 8px 0;">${t}</h2>
      ${c}
    </div>`;

  const hasSocial = cv.contact?.linkedin || cv.contact?.github || cv.contact?.portfolio || cv.contact?.socialLinks?.length;

  return `<div style="font-family:${font};color:${text};background:white;padding:${s.marginV + 8}px ${s.marginH + 8}px;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="margin-bottom:${sp + 6}px;border-bottom:1px solid #e7e5e4;padding-bottom:14px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;">
      <div style="flex:1;">
        <h1 style="font-size:24pt;font-weight:normal;margin:0;color:#1c1917;letter-spacing:-0.5px;">${cv.fullName}</h1>
        <p style="font-size:8pt;text-transform:uppercase;letter-spacing:0.2em;color:${accent};margin:6px 0 0 0;">${cv.title}</p>
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        ${photo ? photoHtml(photo, 72, 'rounded', `2px solid ${accent}`) : ''}
        <div style="text-align:right;font-size:8pt;color:#78716c;line-height:1.8;">
          ${cv.contact?.email    ? `<div>${cv.contact.email}</div>` : ''}
          ${cv.contact?.phone    ? `<div>${cv.contact.phone}</div>` : ''}
          ${cv.contact?.location ? `<div>${cv.contact.location}</div>` : ''}
        </div>
      </div>
    </div>
    ${hasSocial ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:14px;font-size:8pt;color:#78716c;">
      ${buildSocialLinks(cv, '#78716c')}
    </div>` : ''}
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
      ${p.technologies ? `<p style="margin:0 0 2px 0;font-size:8.5pt;color:${accent};font-style:italic;">${p.technologies}</p>` : ''}
      ${projectLink(p.url, accent)}
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
function buildExecutiveHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const accent = ac(s, '#1d3461');
  const font   = ff(s, "'Garamond','EB Garamond',Georgia,serif");
  const sp     = s.sectionSpacing;

  const exs = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 8}px;">
      <h2 style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${accent};margin:0 0 10px 0;padding-bottom:5px;border-bottom:2px solid ${accent};">${t}</h2>
      ${c}
    </div>`;

  const hasSocial = cv.contact?.linkedin || cv.contact?.github || cv.contact?.portfolio || cv.contact?.socialLinks?.length;

  return `<div style="font-family:${font};color:#1a1a2e;background:white;padding:0;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="background:${accent};color:white;padding:${s.marginV + 4}px ${s.marginH + 8}px ${s.marginV}px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div>
        <div style="border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:10px;margin-bottom:10px;">
          <h1 style="font-size:26pt;font-weight:normal;margin:0;letter-spacing:1px;color:white;">${cv.fullName}</h1>
          <p style="color:#93c5fd;margin:5px 0 0 0;letter-spacing:3px;text-transform:uppercase;font-size:8.5pt;">${cv.title}</p>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:20px;font-size:8.5pt;color:rgba(255,255,255,0.75);">
          ${cv.contact?.email    ? `<span>✉ ${cv.contact.email}</span>` : ''}
          ${cv.contact?.phone    ? `<span>✆ ${cv.contact.phone}</span>` : ''}
          ${cv.contact?.location ? `<span>📍 ${cv.contact.location}</span>` : ''}
          ${hasSocial ? buildSocialLinks(cv, 'rgba(255,255,255,0.75)') : ''}
        </div>
      </div>
      ${photo ? photoHtml(photo, 96, 'circle', '3px solid rgba(255,255,255,0.4)') : ''}
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
          ${p.technologies ? `<p style="margin:0 0 3px 0;font-size:8pt;color:#64748b;font-style:italic;">${p.technologies}</p>` : ''}
          ${projectLink(p.url, accent)}
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
function buildCreativeHtml(cv: CVData, s: CVStyle, photo?: string): string {
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

  const hasSocial = cv.contact?.linkedin || cv.contact?.github || cv.contact?.portfolio || cv.contact?.socialLinks?.length;

  return `<div style="font-family:${font};background:white;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};color:#1e1b4b;">
  <div style="background:linear-gradient(135deg,${accent} 0%,${accent2} 100%);padding:${s.marginV + 8}px ${s.marginH + 8}px;color:white;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-30px;right:-30px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,0.07);"></div>
    <div style="display:flex;align-items:center;gap:20px;">
      ${photo ? photoHtml(photo, 80, 'circle', '3px solid rgba(255,255,255,0.5)') : ''}
      <div>
        <h1 style="font-size:24pt;font-weight:900;margin:0 0 5px 0;letter-spacing:-1px;color:white;">${cv.fullName}</h1>
        <p style="font-size:10.5pt;font-weight:500;color:rgba(255,255,255,0.85);margin:0 0 14px 0;">${cv.title}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:8pt;color:rgba(255,255,255,0.9);">
          ${cv.contact?.email    ? `<span style="background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:20px;">✉ ${cv.contact.email}</span>` : ''}
          ${cv.contact?.phone    ? `<span style="background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:20px;">✆ ${cv.contact.phone}</span>` : ''}
          ${cv.contact?.location ? `<span style="background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:20px;">📍 ${cv.contact.location}</span>` : ''}
          ${hasSocial ? buildSocialLinks(cv, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.15)', '20px') : ''}
        </div>
      </div>
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
          <p style="margin:0 0 4px 0;font-size:${s.fontSize - 0.5}pt;color:#4b5563;">${p.description}</p>
          ${p.technologies ? `<p style="margin:0 0 4px 0;font-size:8pt;color:${accent2};font-style:italic;">${p.technologies}</p>` : ''}
          ${projectLink(p.url, accent)}
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

// ─── DARK GOLD ────────────────────────────────────────────────────────────────
function buildDarkGoldHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const gold    = ac(s, '#c9a84c');
  const font    = ff(s, "'Georgia','Times New Roman',serif");
  const sp      = s.sectionSpacing;
  const sidebar = '#0d1117';
  const bg      = '#161b22';

  const initials = cv.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const sst = (t: string) =>
    `<p style="font-size:7pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;color:${gold};margin:0 0 8px 0;padding-bottom:4px;border-bottom:1px solid rgba(201,168,76,0.3);">${t}</p>`;

  const smt = (t: string) =>
    `<p style="font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;color:${gold};margin:0 0 10px 0;padding-bottom:4px;border-bottom:1px solid rgba(201,168,76,0.25);">${t}</p>`;

  const skillBar = (name: string, pct: number) =>
    `<div style="margin-bottom:6px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
        <span style="font-size:8pt;color:#e2e8f0;">${name}</span>
      </div>
      <div style="height:3px;background:rgba(255,255,255,0.1);border-radius:2px;">
        <div style="height:3px;width:${pct}%;background:linear-gradient(90deg,${gold},#e8c96e);border-radius:2px;"></div>
      </div>
    </div>`;

  const skillsForBars = (cv.skills || []).slice(0, 6);
  const skillsForTags = (cv.skills || []).slice(6);
  const hasSocial = cv.contact?.linkedin || cv.contact?.github || cv.contact?.portfolio || cv.contact?.socialLinks?.length;

  return `<div style="font-family:${font};background:white;display:flex;width:794px;min-height:1123px;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="width:240px;background:${sidebar};flex-shrink:0;padding:${s.marginV + 8}px ${Math.round(s.marginH * 0.65)}px;display:flex;flex-direction:column;gap:${sp + 4}px;">
    <div style="text-align:center;margin-bottom:${sp}px;">
      ${photo ? photoHtml(photo, 72, 'circle', `2px solid ${gold}`) : `
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,${gold},#e8c96e);display:flex;align-items:center;justify-content:center;margin:0 auto 10px auto;border:2px solid rgba(201,168,76,0.5);">
        <span style="font-size:22pt;font-weight:bold;color:#0d1117;letter-spacing:-1px;">${initials}</span>
      </div>
      `}
      <p style="font-size:9pt;font-weight:bold;color:white;margin:0;letter-spacing:0.5px;">${cv.fullName}</p>
      <p style="font-size:7.5pt;color:${gold};margin:3px 0 0 0;letter-spacing:0.1em;">${cv.title}</p>
    </div>
    <div>
      ${sst('Contact')}
      <div style="display:flex;flex-direction:column;gap:5px;">
        ${cv.contact?.phone    ? `<div style="display:flex;align-items:center;gap:6px;font-size:8pt;color:#94a3b8;"><span style="color:${gold};">✆</span>${cv.contact.phone}</div>` : ''}
        ${cv.contact?.email    ? `<div style="display:flex;align-items:center;gap:6px;font-size:8pt;color:#94a3b8;word-break:break-all;"><span style="color:${gold};">✉</span>${cv.contact.email}</div>` : ''}
        ${cv.contact?.location ? `<div style="display:flex;align-items:center;gap:6px;font-size:8pt;color:#94a3b8;"><span style="color:${gold};">📍</span>${cv.contact.location}</div>` : ''}
        ${hasSocial ? buildSocialLinks(cv, '#94a3b8').split('</a>').filter(Boolean).map((l: string) => `<div style="font-size:7.5pt;word-break:break-all;">${l}</a></div>`).join('') : ''}
      </div>
    </div>
    ${cv.education?.length ? `<div>
      ${sst('Formation')}
      ${cv.education.map((e: any) => `
        <div style="margin-bottom:8px;">
          <p style="font-weight:bold;font-size:8.5pt;color:white;margin:0;">${e.degree}</p>
          <p style="font-size:7.5pt;color:${gold};margin:1px 0;">${e.school}</p>
          <p style="font-size:7pt;color:#64748b;margin:0;">${e.dates}</p>
        </div>`).join('')}
    </div>` : ''}
    ${skillsForBars.length ? `<div>
      ${sst('Compétences')}
      ${skillsForBars.map((sk: string, i: number) => skillBar(sk, 95 - i * 8)).join('')}
      ${skillsForTags.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:6px;">${skillsForTags.map((sk: string) => `<span style="background:rgba(201,168,76,0.15);color:${gold};font-size:7pt;padding:1px 6px;border-radius:3px;border:1px solid rgba(201,168,76,0.3);">${sk}</span>`).join('')}</div>` : ''}
    </div>` : ''}
    ${cv.languages?.length ? `<div>
      ${sst('Langues')}
      ${cv.languages.map((l: any) => `
        <div style="margin-bottom:5px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
            <span style="font-size:8pt;color:#e2e8f0;">${l.language}</span>
            <span style="font-size:7pt;color:${gold};">${l.level}</span>
          </div>
        </div>`).join('')}
    </div>` : ''}
    ${cv.interests?.length ? `<div>
      ${sst("Intérêts")}
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${cv.interests.map((i: string) => `<span style="background:rgba(201,168,76,0.12);color:#94a3b8;font-size:7.5pt;padding:2px 8px;border-radius:12px;border:1px solid rgba(201,168,76,0.2);">${i}</span>`).join('')}
      </div>
    </div>` : ''}
  </div>
  <div style="flex:1;background:white;padding:${s.marginV + 4}px ${s.marginH}px;">
    ${cv.professionalSummary ? `<div style="margin-bottom:${sp + 6}px;">
      ${smt('Profil')}
      <p style="color:#374151;font-size:${s.fontSize - 0.5}pt;line-height:${s.lineHeight + 0.1};margin:0;font-style:italic;">${cv.professionalSummary}</p>
    </div>` : ''}
    ${cv.experiences?.length ? `<div style="margin-bottom:${sp + 6}px;">
      ${smt('Expériences professionnelles')}
      ${cv.experiences.map((e: any) => `
        <div style="margin-bottom:${sp + 2}px;padding-left:12px;border-left:2px solid ${gold};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
            <div>
              <strong style="font-size:${s.fontSize}pt;color:#111827;">${e.position}</strong>
              <span style="color:${gold};font-size:${s.fontSize - 1}pt;font-style:italic;margin-left:6px;">${e.company}</span>
            </div>
            <span style="font-size:8pt;color:#9ca3af;white-space:nowrap;margin-left:8px;background:#f9fafb;padding:1px 6px;border-radius:10px;border:1px solid #e5e7eb;">${e.dates}</span>
          </div>
          <ul style="margin:4px 0 0 0;padding-left:14px;">
            ${e.bullets?.map((b: string) => `<li style="font-size:${s.fontSize - 0.5}pt;color:#4b5563;margin-bottom:2px;">${b}</li>`).join('') || ''}
          </ul>
        </div>`).join('')}
    </div>` : ''}
    ${cv.projects?.length ? `<div style="margin-bottom:${sp + 6}px;">
      ${smt('Projets notables')}
      ${cv.projects.map((p: any) => `
        <div style="margin-bottom:${sp}px;background:#fafafa;border:1px solid #e5e7eb;border-left:3px solid ${gold};border-radius:4px;padding:8px 10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <strong style="font-size:${s.fontSize}pt;color:#111827;">${p.name}</strong>
            ${p.dates ? `<span style="font-size:7.5pt;color:#9ca3af;">${p.dates}</span>` : ''}
          </div>
          <p style="margin:0 0 4px 0;font-size:${s.fontSize - 0.5}pt;color:#4b5563;">${p.description}</p>
          ${p.technologies ? `<p style="margin:0 0 4px 0;font-size:8pt;color:${gold};font-style:italic;">${p.technologies}</p>` : ''}
          ${projectLink(p.url, gold)}
        </div>`).join('')}
    </div>` : ''}
    ${cv.certifications?.length ? `<div style="margin-bottom:${sp}px;">
      ${smt('Certifications')}
      ${cv.certifications.map((c: any) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
          <span style="color:${gold};font-size:10pt;">▸</span>
          <div>
            <strong style="font-size:${s.fontSize - 0.5}pt;color:#111827;">${c.name}</strong>
            ${c.issuer ? `<span style="color:#6b7280;font-size:${s.fontSize - 1}pt;"> · ${c.issuer}</span>` : ''}
            ${c.date ? `<span style="color:#9ca3af;font-size:${s.fontSize - 1}pt;"> · ${c.date}</span>` : ''}
          </div>
        </div>`).join('')}
    </div>` : ''}
  </div>
</div>`;
}

// ─── PHOTO NOIR ───────────────────────────────────────────────────────────────
function buildPhotoNoirHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const accent = ac(s, '#1a1a1a');
  const font   = ff(s, "Georgia,'Times New Roman',serif");
  const sp     = s.sectionSpacing;
  const initials = cv.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const sideSection = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <p style="font-size:7pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;color:#aaa;margin:0 0 7px 0;padding-bottom:4px;border-bottom:1px solid #333;">${t}</p>
      ${c}
    </div>`;

  const mainSection = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <p style="font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.25em;color:#888;margin:0 0 10px 0;text-align:center;border-bottom:1px solid #e0e0e0;padding-bottom:4px;">${t}</p>
      ${c}
    </div>`;

  return `<div style="font-family:${font};background:white;display:flex;width:794px;min-height:1123px;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="width:210px;background:#1a1a1a;flex-shrink:0;display:flex;flex-direction:column;">
    <div style="background:#2a2a2a;height:200px;display:flex;align-items:center;justify-content:center;border-bottom:2px solid #333;">
      ${photo ? photoHtml(photo, 110, 'circle', '2px solid #555') : `
      <div style="width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#3a3a3a,#555);display:flex;align-items:center;justify-content:center;border:2px solid #555;">
        <span style="font-size:28pt;font-weight:bold;color:#ccc;letter-spacing:-1px;">${initials}</span>
      </div>
      `}
    </div>
    <div style="padding:20px 16px;flex:1;">
      ${sideSection('Profil', `<p style="font-size:8.5pt;color:#bbb;line-height:${s.lineHeight + 0.1};margin:0;">${cv.professionalSummary || ''}</p>`)}
      ${sideSection('Contact', `
        <div style="display:flex;flex-direction:column;gap:5px;font-size:8pt;color:#aaa;">
          ${cv.contact?.location ? `<div style="display:flex;align-items:flex-start;gap:6px;"><span style="color:#777;font-size:9pt;">📍</span><span>${cv.contact.location}</span></div>` : ''}
          ${cv.contact?.email ? `<div style="display:flex;align-items:flex-start;gap:6px;word-break:break-all;"><span style="color:#777;font-size:9pt;">✉</span><span>${cv.contact.email}</span></div>` : ''}
          ${cv.contact?.phone ? `<div style="display:flex;align-items:flex-start;gap:6px;"><span style="color:#777;font-size:9pt;">✆</span><span>${cv.contact.phone}</span></div>` : ''}
          ${cv.contact?.linkedin ? `<div style="display:flex;align-items:flex-start;gap:6px;word-break:break-all;"><span style="color:#777;">in</span><a href="${cv.contact.linkedin}" style="color:#aaa;text-decoration:none;">${shortenUrl(cv.contact.linkedin)}</a></div>` : ''}
        </div>
      `)}
      ${cv.languages?.length ? sideSection('Langues', cv.languages.map(l =>
        `<div style="margin-bottom:6px;">
          <div style="display:flex;justify-content:space-between;font-size:8pt;color:#ccc;margin-bottom:2px;">
            <span>${l.language}</span><span style="color:#888;">${l.level}</span>
          </div>
          <div style="height:2px;background:#333;border-radius:1px;"><div style="height:2px;background:#777;width:${l.level.toLowerCase().includes('nat') || l.level.toLowerCase().includes('c2') ? '100' : l.level.toLowerCase().includes('b') ? '65' : '40'}%;border-radius:1px;"></div></div>
        </div>`).join('')) : ''}
      ${cv.interests?.length ? sideSection("Centres d'intérêt", `
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${cv.interests.map(i => `<span style="font-size:8pt;color:#aaa;">— ${i}</span>`).join('')}
        </div>
      `) : ''}
    </div>
  </div>
  <div style="flex:1;background:white;padding:${s.marginV + 4}px ${s.marginH}px;">
    <div style="margin-bottom:${sp + 6}px;padding-bottom:12px;border-bottom:2px solid #1a1a1a;">
      <h1 style="font-size:26pt;font-weight:bold;margin:0 0 3px 0;color:#1a1a1a;letter-spacing:1px;">${cv.fullName}</h1>
      <p style="font-size:9.5pt;text-transform:uppercase;letter-spacing:0.3em;color:#888;margin:0;font-style:italic;">${cv.title}</p>
    </div>
    ${cv.education?.length ? mainSection('Formation', cv.education.map(e =>
      `<div style="display:flex;justify-content:space-between;margin-bottom:6px;align-items:baseline;">
        <div>
          <p style="font-size:${s.fontSize - 0.5}pt;font-weight:bold;color:#1a1a1a;margin:0;">${e.degree}</p>
          <p style="font-size:${s.fontSize - 1}pt;color:#666;margin:1px 0 0 0;">${e.school}</p>
        </div>
        <span style="font-size:8pt;color:#999;white-space:nowrap;margin-left:8px;">${e.dates}</span>
      </div>`).join('')) : ''}
    ${cv.experiences?.length ? mainSection('Expériences', cv.experiences.map(e =>
      `<div style="margin-bottom:${sp}px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">
          <div>
            <span style="font-size:8pt;color:#888;white-space:nowrap;">${e.dates}</span><br>
            <strong style="font-size:${s.fontSize - 0.5}pt;color:#1a1a1a;">${e.company}</strong>
          </div>
          <span style="font-size:${s.fontSize - 1}pt;color:#555;font-style:italic;text-align:right;max-width:160px;">${e.position}</span>
        </div>
        <ul style="margin:3px 0 0 0;padding-left:14px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 1}pt;color:#444;margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
      </div>`).join('')) : ''}
    ${cv.skills?.length ? mainSection('Compétences', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
        ${cv.skills.map(sk => `<div style="display:flex;align-items:center;gap:6px;font-size:${s.fontSize - 1}pt;color:#333;"><span style="color:#888;font-size:9pt;">—</span>${sk}</div>`).join('')}
      </div>
    `) : ''}
    ${cv.certifications?.length ? mainSection('Certifications', cv.certifications.map(c =>
      `<p style="margin:2px 0;font-size:${s.fontSize - 0.5}pt;"><strong>${c.name}</strong>${c.issuer ? `<span style="color:#777;"> · ${c.issuer}</span>` : ''}${c.date ? `<span style="color:#999;"> · ${c.date}</span>` : ''}</p>`
    ).join('')) : ''}
  </div>
</div>`;
}

// ─── ÉDITORIAL ────────────────────────────────────────────────────────────────
function buildEditorialHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const accent  = ac(s, '#4a5240');
  const font    = ff(s, "'Trebuchet MS','Arial',sans-serif");
  const sp      = s.sectionSpacing;
  const initials = cv.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const leftSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <p style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 8px 0;">${t}</p>
      ${c}
    </div>`;

  const rightSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <p style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin:0 0 8px 0;">${t}</p>
      ${c}
    </div>`;

  return `<div style="font-family:${font};background:#f5f5f3;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};color:#222;">
  <div style="background:white;padding:${s.marginV + 8}px ${s.marginH + 8}px ${s.marginV}px;border-bottom:3px solid #e0e0e0;">
    <div style="display:flex;align-items:center;gap:20px;margin-bottom:10px;">
      ${photo ? photoHtml(photo, 90, 'circle', `3px solid ${accent}`) : `
      <div style="width:90px;height:90px;border-radius:50%;background:${accent};flex-shrink:0;display:flex;align-items:center;justify-content:center;border:3px solid #ddd;">
        <span style="font-size:24pt;font-weight:900;color:white;">${initials}</span>
      </div>
      `}
      <div>
        <h1 style="font-size:30pt;font-weight:900;margin:0;line-height:0.95;text-transform:uppercase;letter-spacing:-1px;color:#111;">${cv.fullName}</h1>
        <p style="font-size:10pt;color:${accent};margin:8px 0 0 0;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;">${cv.title}</p>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:8pt;color:#666;padding-top:10px;border-top:1px solid #e5e5e5;">
      ${cv.contact?.email ? `<span>✉ ${cv.contact.email}</span>` : ''}
      ${cv.contact?.phone ? `<span>✆ ${cv.contact.phone}</span>` : ''}
      ${cv.contact?.location ? `<span>📍 ${cv.contact.location}</span>` : ''}
      ${buildSocialLinks(cv, '#666')}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:0;">
    <div style="padding:${s.marginV}px ${s.marginH}px;background:white;border-right:1px solid #e5e5e5;">
      ${cv.professionalSummary ? `<div style="background:#f9f9f7;border-left:3px solid ${accent};padding:10px 14px;margin-bottom:${sp + 4}px;"><p style="margin:0;font-size:${s.fontSize - 0.5}pt;color:#444;line-height:${s.lineHeight + 0.1};font-style:italic;">${cv.professionalSummary}</p></div>` : ''}
      ${cv.experiences?.length ? leftSec('Work Experience', cv.experiences.map(e =>
        `<div style="margin-bottom:${sp}px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
            <div><strong style="font-size:${s.fontSize}pt;color:#111;">${e.company}</strong> <span style="color:#888;font-size:${s.fontSize - 1}pt;">| ${e.dates}</span></div>
          </div>
          <p style="font-size:${s.fontSize - 0.5}pt;color:${accent};font-weight:700;margin:1px 0 4px 0;text-transform:uppercase;letter-spacing:0.05em;">${e.position}</p>
          <ul style="margin:0;padding-left:12px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 0.5}pt;color:#444;margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
        </div>`).join('')) : ''}
      ${cv.projects?.length ? leftSec('Projets', cv.projects.map(p =>
        `<div style="margin-bottom:8px;background:#f9f9f7;padding:8px 10px;border-radius:4px;">
          <strong style="font-size:${s.fontSize - 0.5}pt;">${p.name}</strong>${p.dates ? `<span style="color:#888;font-size:8pt;"> · ${p.dates}</span>` : ''}
          <p style="margin:3px 0;font-size:${s.fontSize - 0.5}pt;color:#555;">${p.description}</p>
          ${p.technologies ? `<p style="margin:0;font-size:8pt;color:${accent};font-style:italic;">${p.technologies}</p>` : ''}
          ${projectLink(p.url, accent)}
        </div>`).join('')) : ''}
    </div>
    <div style="padding:${s.marginV}px ${Math.round(s.marginH * 0.75)}px;background:#f5f5f3;">
      ${cv.skills?.length ? rightSec('Skills', `
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${cv.skills.map(sk => `<span style="background:white;border:1px solid #ddd;color:#333;font-size:7.5pt;padding:2px 9px;border-radius:20px;">${sk}</span>`).join('')}
        </div>
      `) : ''}
      ${cv.education?.length ? rightSec('Education', cv.education.map(e =>
        `<div style="margin-bottom:8px;">
          <strong style="font-size:${s.fontSize - 0.5}pt;">${e.school}</strong> <span style="font-size:8pt;color:#888;">| ${e.dates}</span><br>
          <span style="font-size:${s.fontSize - 1}pt;color:#555;">${e.degree}</span>
        </div>`).join('')) : ''}
      ${cv.languages?.length ? rightSec('Languages', `
        ${cv.languages.map(l => `<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:${s.fontSize - 0.5}pt;">
          <span style="font-weight:700;">${l.language}</span>
          <span style="color:#888;font-size:8pt;">${l.level}</span>
        </div>
        <div style="height:2px;background:#e0e0e0;border-radius:1px;margin-bottom:6px;">
          <div style="height:2px;background:${accent};width:${l.level.toLowerCase().includes('nat') || l.level.toLowerCase().includes('c2') ? '100' : l.level.toLowerCase().includes('b2') ? '75' : l.level.toLowerCase().includes('b1') ? '60' : l.level.toLowerCase().includes('a') ? '40' : '70'}%;border-radius:1px;"></div>
        </div>`).join('')}
      `) : ''}
      ${cv.certifications?.length ? rightSec('Certifications', cv.certifications.map(c =>
        `<p style="margin:2px 0;font-size:${s.fontSize - 0.5}pt;"><strong>${c.name}</strong>${c.issuer ? `<span style="color:#888;font-size:8pt;"> · ${c.issuer}</span>` : ''}</p>`
      ).join('')) : ''}
      ${cv.interests?.length ? rightSec("Centres d'intérêt", `<p style="font-size:${s.fontSize - 0.5}pt;color:#555;">${cv.interests.join(' · ')}</p>`) : ''}
    </div>
  </div>
</div>`;
}

// ─── SPLIT PHOTO ──────────────────────────────────────────────────────────────
function buildSplitPhotoHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const accent  = ac(s, '#0f172a');
  const blue    = s.accentColor ? s.accentColor : '#1e3a8a';
  const font    = ff(s, "'Arial','Helvetica',sans-serif");
  const sp      = s.sectionSpacing;
  const initials = cv.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const mainSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <h2 style="font-size:11pt;font-weight:900;text-transform:uppercase;color:#0f172a;margin:0 0 10px 0;letter-spacing:0.05em;">${t}</h2>
      ${c}
    </div>`;

  const sideSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <p style="font-size:7pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;color:#94a3b8;margin:0 0 8px 0;">${t}</p>
      ${c}
    </div>`;

  return `<div style="font-family:${font};background:white;display:flex;width:794px;min-height:1123px;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="width:220px;background:${accent};flex-shrink:0;padding:${s.marginV + 8}px ${Math.round(s.marginH * 0.65)}px;display:flex;flex-direction:column;gap:${sp}px;">
    <div style="text-align:center;margin-bottom:${sp}px;">
      ${photo ? photoHtml(photo, 100, 'rounded', `1px solid #334155`) : `
      <div style="width:100px;height:100px;border-radius:4px;background:#1e293b;display:flex;align-items:center;justify-content:center;margin:0 auto 12px auto;border:1px solid #334155;">
        <span style="font-size:30pt;font-weight:900;color:#94a3b8;">${initials}</span>
      </div>
      `}
      <h1 style="font-size:13pt;font-weight:900;color:white;margin:0;line-height:1.1;">${cv.fullName}</h1>
      <p style="font-size:8pt;color:#60a5fa;margin:4px 0 0 0;text-transform:uppercase;letter-spacing:0.1em;">${cv.title}</p>
    </div>
    ${sideSec('Contact', `
      <div style="display:flex;flex-direction:column;gap:6px;font-size:8pt;color:#94a3b8;">
        ${cv.contact?.location ? `<div>${cv.contact.location}</div>` : ''}
        ${cv.contact?.email ? `<div style="word-break:break-all;">${cv.contact.email}</div>` : ''}
        ${cv.contact?.phone ? `<div>${cv.contact.phone}</div>` : ''}
        ${cv.contact?.linkedin ? `<div style="word-break:break-all;"><a href="${cv.contact.linkedin}" style="color:#60a5fa;text-decoration:none;">${shortenUrl(cv.contact.linkedin)}</a></div>` : ''}
        ${cv.contact?.github ? `<div style="word-break:break-all;"><a href="${cv.contact.github}" style="color:#60a5fa;text-decoration:none;">${shortenUrl(cv.contact.github)}</a></div>` : ''}
      </div>
    `)}
    ${cv.languages?.length ? sideSec('Langues', cv.languages.map(l =>
      `<p style="margin:3px 0;font-size:8.5pt;color:#cbd5e1;">${l.language} <span style="color:#64748b;">— ${l.level}</span></p>`).join('')) : ''}
    ${cv.skills?.length ? sideSec('Compétences', cv.skills.map(sk =>
      `<p style="margin:2px 0;font-size:8pt;color:#94a3b8;display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:#60a5fa;flex-shrink:0;"></span>${sk}</p>`
    ).join('')) : ''}
    ${cv.interests?.length ? sideSec("Centres d'intérêt", `
      <div style="display:flex;flex-direction:column;gap:3px;">
        ${cv.interests.map(i => `<span style="font-size:8pt;color:#64748b;">• ${i}</span>`).join('')}
      </div>
    `) : ''}
  </div>
  <div style="flex:1;padding:${s.marginV}px ${s.marginH}px;">
    ${cv.professionalSummary ? `<div style="border-left:3px solid ${blue};padding-left:12px;margin-bottom:${sp + 6}px;"><p style="margin:0;font-size:${s.fontSize - 0.5}pt;color:#475569;line-height:${s.lineHeight + 0.1};">${cv.professionalSummary}</p></div>` : ''}
    ${cv.experiences?.length ? mainSec('Expériences professionnelles', cv.experiences.map(e =>
      `<div style="margin-bottom:${sp + 2}px;display:flex;gap:12px;">
        <div style="text-align:right;width:90px;flex-shrink:0;padding-top:2px;">
          <span style="font-size:7.5pt;color:#94a3b8;">${e.dates}</span>
        </div>
        <div style="flex:1;border-left:2px solid #e2e8f0;padding-left:12px;position:relative;">
          <div style="width:8px;height:8px;border-radius:50%;background:${blue};position:absolute;left:-5px;top:4px;"></div>
          <strong style="font-size:${s.fontSize}pt;color:${blue};">${e.position}</strong><br>
          <span style="font-size:${s.fontSize - 1}pt;color:#475569;font-weight:600;">${e.company}</span>
          <ul style="margin:4px 0 0 0;padding-left:12px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 0.5}pt;color:#475569;margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
        </div>
      </div>`).join('')) : ''}
    ${cv.education?.length ? mainSec('Formations', cv.education.map(e =>
      `<div style="margin-bottom:8px;display:flex;gap:12px;">
        <div style="text-align:right;width:90px;flex-shrink:0;padding-top:2px;font-size:7.5pt;color:#94a3b8;">${e.dates}</div>
        <div style="flex:1;border-left:2px solid #e2e8f0;padding-left:12px;position:relative;">
          <div style="width:8px;height:8px;border-radius:50%;background:${blue};position:absolute;left:-5px;top:4px;"></div>
          <strong style="font-size:${s.fontSize - 0.5}pt;">${e.degree}</strong><br>
          <span style="font-size:${s.fontSize - 1}pt;color:#64748b;">${e.school}</span>
        </div>
      </div>`).join('')) : ''}
    ${cv.projects?.length ? mainSec('Projets', cv.projects.map(p =>
      `<div style="margin-bottom:8px;background:#f8fafc;border:1px solid #e2e8f0;padding:8px 10px;border-radius:4px;border-top:2px solid ${blue};">
        <strong style="font-size:${s.fontSize - 0.5}pt;color:${accent};">${p.name}</strong>${p.dates ? `<span style="color:#94a3b8;font-size:8pt;"> · ${p.dates}</span>` : ''}
        <p style="margin:3px 0;font-size:${s.fontSize - 0.5}pt;color:#475569;">${p.description}</p>
        ${p.technologies ? `<p style="margin:0 0 3px 0;font-size:8pt;color:${blue};font-style:italic;">${p.technologies}</p>` : ''}
        ${projectLink(p.url, blue)}
      </div>`).join('')) : ''}
    ${cv.certifications?.length ? mainSec('Certifications', cv.certifications.map(c =>
      `<p style="margin:3px 0;font-size:${s.fontSize - 0.5}pt;"><strong>${c.name}</strong>${c.issuer ? `<span style="color:#64748b;"> · ${c.issuer}</span>` : ''}${c.date ? `<span style="color:#94a3b8;"> · ${c.date}</span>` : ''}</p>`
    ).join('')) : ''}
  </div>
</div>`;
}

// ─── GRADIENT WARM ────────────────────────────────────────────────────────────
function buildGradientWarmHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const warm    = ac(s, '#7c2d12');
  const warm2   = s.accentColor ? s.accentColor : '#9f1239';
  const font    = ff(s, "'Georgia','Times New Roman',serif");
  const sp      = s.sectionSpacing;
  const initials = cv.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const sideSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <p style="font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.5);margin:0 0 8px 0;">${t}</p>
      ${c}
    </div>`;

  const mainSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <h2 style="font-size:9pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;color:white;margin:0 0 10px 0;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.2);">${t}</h2>
      ${c}
    </div>`;

  return `<div style="font-family:${font};background:linear-gradient(160deg,#7c2d12 0%,#9f1239 40%,#6b21a8 100%);display:flex;width:794px;min-height:1123px;font-size:${s.fontSize}pt;line-height:${s.lineHeight};">
  <div style="width:220px;flex-shrink:0;padding:${s.marginV + 8}px ${Math.round(s.marginH * 0.65)}px;display:flex;flex-direction:column;gap:${sp}px;border-right:1px solid rgba(255,255,255,0.1);">
    <div style="text-align:center;margin-bottom:8px;">
      ${photo ? photoHtml(photo, 90, 'circle', '2px solid rgba(255,255,255,0.3)') : `
      <div style="width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 12px auto;border:2px solid rgba(255,255,255,0.3);">
        <span style="font-size:26pt;font-weight:bold;color:white;">${initials}</span>
      </div>
      `}
      <h1 style="font-size:12pt;font-weight:bold;color:white;margin:0;line-height:1.2;">${cv.fullName}</h1>
      <p style="font-size:8pt;color:rgba(255,255,255,0.7);margin:4px 0 0 0;font-style:italic;">${cv.title}</p>
    </div>
    ${sideSec('Contact', `
      <div style="display:flex;flex-direction:column;gap:5px;font-size:8pt;color:rgba(255,255,255,0.75);">
        ${cv.contact?.email ? `<div style="word-break:break-all;"><span style="opacity:0.5;">✉</span> ${cv.contact.email}</div>` : ''}
        ${cv.contact?.phone ? `<div><span style="opacity:0.5;">✆</span> ${cv.contact.phone}</div>` : ''}
        ${cv.contact?.location ? `<div><span style="opacity:0.5;">📍</span> ${cv.contact.location}</div>` : ''}
        ${cv.contact?.linkedin ? `<div style="word-break:break-all;"><a href="${cv.contact.linkedin}" style="color:rgba(255,255,255,0.75);text-decoration:none;">${shortenUrl(cv.contact.linkedin)}</a></div>` : ''}
      </div>
    `)}
    ${sideSec('Hard Skills', cv.skills?.slice(0, 8).map(sk =>
      `<div style="margin-bottom:4px;">
        <p style="margin:0 0 2px 0;font-size:8pt;color:rgba(255,255,255,0.9);">${sk}</p>
        <div style="height:2px;background:rgba(255,255,255,0.15);border-radius:1px;"><div style="height:2px;background:rgba(255,255,255,0.6);width:75%;border-radius:1px;"></div></div>
      </div>`).join('') || '')}
    ${cv.education?.length ? sideSec('Education', cv.education.map(e =>
      `<div style="margin-bottom:7px;font-size:8pt;">
        <p style="font-weight:bold;color:white;margin:0;">${e.degree}</p>
        <p style="color:rgba(255,255,255,0.65);margin:1px 0;">${e.school}</p>
        <p style="color:rgba(255,255,255,0.45);margin:0;font-size:7.5pt;">${e.dates}</p>
      </div>`).join('')) : ''}
    ${cv.languages?.length ? sideSec('Langues', cv.languages.map(l =>
      `<div style="display:flex;justify-content:space-between;font-size:8pt;margin-bottom:3px;">
        <span style="color:rgba(255,255,255,0.9);">${l.language}</span>
        <span style="color:rgba(255,255,255,0.5);">${l.level}</span>
      </div>`).join('')) : ''}
  </div>
  <div style="flex:1;padding:${s.marginV}px ${s.marginH}px;">
    ${cv.professionalSummary ? `<div style="margin-bottom:${sp + 6}px;background:rgba(255,255,255,0.08);border-radius:6px;padding:12px 14px;border-left:3px solid rgba(255,255,255,0.4);"><p style="margin:0;font-size:${s.fontSize - 0.5}pt;color:rgba(255,255,255,0.85);line-height:${s.lineHeight + 0.1};font-style:italic;">${cv.professionalSummary}</p></div>` : ''}
    ${cv.experiences?.length ? mainSec('Expériences', cv.experiences.map(e =>
      `<div style="margin-bottom:${sp + 2}px;padding-left:14px;border-left:2px solid rgba(255,255,255,0.3);position:relative;">
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.5);position:absolute;left:-6px;top:3px;"></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
          <strong style="color:white;font-size:${s.fontSize}pt;">${e.position}</strong>
          <span style="font-size:8pt;color:rgba(255,255,255,0.5);white-space:nowrap;margin-left:8px;">${e.dates}</span>
        </div>
        <span style="font-size:${s.fontSize - 1}pt;color:rgba(255,255,255,0.65);">${e.company}</span>
        <ul style="margin:4px 0 0 0;padding-left:12px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 0.5}pt;color:rgba(255,255,255,0.75);margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
      </div>`).join('')) : ''}
    ${cv.projects?.length ? mainSec('Projets', cv.projects.map(p =>
      `<div style="margin-bottom:8px;background:rgba(255,255,255,0.07);border-radius:6px;padding:9px 11px;">
        <strong style="color:white;font-size:${s.fontSize - 0.5}pt;">${p.name}</strong>${p.dates ? `<span style="color:rgba(255,255,255,0.45);font-size:8pt;"> · ${p.dates}</span>` : ''}
        <p style="margin:3px 0;font-size:${s.fontSize - 0.5}pt;color:rgba(255,255,255,0.75);">${p.description}</p>
        ${p.technologies ? `<p style="margin:0;font-size:8pt;color:rgba(255,255,255,0.5);font-style:italic;">${p.technologies}</p>` : ''}
      </div>`).join('')) : ''}
    ${cv.certifications?.length || cv.interests?.length ? `<div style="margin-top:${sp}px;border-top:1px solid rgba(255,255,255,0.2);padding-top:${sp}px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      ${cv.certifications?.length ? `<div>
        <p style="font-size:7.5pt;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.45);margin:0 0 6px 0;">Certifications</p>
        ${cv.certifications.map(c => `<p style="margin:2px 0;font-size:${s.fontSize - 0.5}pt;color:rgba(255,255,255,0.8);"><strong>${c.name}</strong>${c.issuer ? `<span style="opacity:0.6;"> · ${c.issuer}</span>` : ''}</p>`).join('')}
      </div>` : ''}
      ${cv.interests?.length ? `<div>
        <p style="font-size:7.5pt;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.45);margin:0 0 6px 0;">Centres d'intérêt</p>
        <p style="font-size:${s.fontSize - 0.5}pt;color:rgba(255,255,255,0.75);">${cv.interests.join(' · ')}</p>
      </div>` : ''}
    </div>` : ''}
  </div>
</div>`;
}

// ─── CORPORATE BLUE ───────────────────────────────────────────────────────────
function buildCorporateBlueHtml(cv: CVData, s: CVStyle, photo?: string): string {
  const navy    = ac(s, '#1e3a5f');
  const font    = ff(s, "'Arial','Helvetica',sans-serif");
  const sp      = s.sectionSpacing;
  const initials = cv.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const leftSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 4}px;">
      <p style="font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.18em;color:rgba(255,255,255,0.6);margin:0 0 8px 0;">${t}</p>
      ${c}
    </div>`;

  const mainSec = (t: string, c: string) =>
    `<div style="margin-bottom:${sp + 6}px;">
      <h2 style="font-size:10pt;font-weight:bold;color:${navy};margin:0 0 10px 0;padding-bottom:5px;border-bottom:2px solid ${navy};text-transform:uppercase;letter-spacing:0.1em;">${t}</h2>
      ${c}
    </div>`;

  return `<div style="font-family:${font};background:white;max-width:794px;margin:0 auto;font-size:${s.fontSize}pt;line-height:${s.lineHeight};color:#1a1a2e;">
  <div style="background:${navy};padding:${s.marginV}px ${s.marginH + 8}px;display:flex;align-items:center;gap:20px;">
    ${photo ? photoHtml(photo, 85, 'circle', '2px solid rgba(255,255,255,0.25)') : `
    <div style="width:85px;height:85px;border-radius:50%;background:rgba(255,255,255,0.12);flex-shrink:0;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.25);">
      <span style="font-size:22pt;font-weight:bold;color:white;">${initials}</span>
    </div>
    `}
    <div>
      <h1 style="font-size:22pt;font-weight:bold;color:white;margin:0 0 4px 0;letter-spacing:0.5px;">${cv.fullName}</h1>
      <p style="font-size:9.5pt;color:rgba(255,255,255,0.75);margin:0;text-transform:uppercase;letter-spacing:0.15em;">${cv.title}</p>
    </div>
  </div>
  ${cv.professionalSummary ? `<div style="background:#eef2f7;padding:12px ${s.marginH + 8}px;border-left:4px solid ${navy};"><p style="margin:0;font-size:${s.fontSize - 0.5}pt;color:#374151;line-height:${s.lineHeight};">${cv.professionalSummary}</p></div>` : ''}
  <div style="display:grid;grid-template-columns:220px 1fr;">
    <div style="background:${navy};padding:${s.marginV}px ${Math.round(s.marginH * 0.65)}px;min-height:600px;">
      ${leftSec('Informations', `
        <div style="display:flex;flex-direction:column;gap:6px;font-size:8pt;color:rgba(255,255,255,0.7);">
          ${cv.contact?.location ? `<div><span style="opacity:0.5;">📍</span> ${cv.contact.location}</div>` : ''}
          ${cv.contact?.phone ? `<div><span style="opacity:0.5;">✆</span> ${cv.contact.phone}</div>` : ''}
          ${cv.contact?.email ? `<div style="word-break:break-all;"><span style="opacity:0.5;">✉</span> ${cv.contact.email}</div>` : ''}
          ${cv.contact?.linkedin ? `<div style="word-break:break-all;"><a href="${cv.contact.linkedin}" style="color:rgba(255,255,255,0.7);text-decoration:none;">${shortenUrl(cv.contact.linkedin)}</a></div>` : ''}
        </div>
      `)}
      ${cv.skills?.length ? leftSec('Compétences', cv.skills.map(sk =>
        `<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;font-size:8pt;color:rgba(255,255,255,0.8);">
          <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.5);flex-shrink:0;"></span>${sk}
        </div>`).join('')) : ''}
      ${cv.languages?.length ? leftSec('Langues', cv.languages.map(l =>
        `<p style="margin:3px 0;font-size:8.5pt;color:rgba(255,255,255,0.8);">${l.language} <span style="color:rgba(255,255,255,0.45);">— ${l.level}</span></p>`
      ).join('')) : ''}
      ${cv.interests?.length ? leftSec("Intérêts", cv.interests.map(i =>
        `<p style="margin:2px 0;font-size:8pt;color:rgba(255,255,255,0.6);">• ${i}</p>`).join('')) : ''}
    </div>
    <div style="padding:${s.marginV}px ${s.marginH}px;">
      ${cv.experiences?.length ? mainSec('Expériences professionnelles', cv.experiences.map(e =>
        `<div style="margin-bottom:${sp + 2}px;padding-left:16px;border-left:2px solid #dbeafe;position:relative;">
          <div style="width:10px;height:10px;border-radius:50%;background:${navy};border:2px solid #93c5fd;position:absolute;left:-6px;top:3px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
            <strong style="font-size:${s.fontSize}pt;color:${navy};">${e.position}</strong>
            <span style="font-size:8pt;color:#94a3b8;white-space:nowrap;margin-left:8px;">${e.dates}</span>
          </div>
          <p style="font-size:${s.fontSize - 1}pt;color:#64748b;margin:0 0 4px 0;font-style:italic;">${e.company}</p>
          <ul style="margin:0;padding-left:12px;">${e.bullets?.map(b => `<li style="font-size:${s.fontSize - 0.5}pt;color:#374151;margin-bottom:2px;">${b}</li>`).join('') || ''}</ul>
        </div>`).join('')) : ''}
      ${cv.education?.length ? mainSec('Formations', cv.education.map(e =>
        `<div style="margin-bottom:${sp}px;padding-left:16px;border-left:2px solid #dbeafe;position:relative;">
          <div style="width:10px;height:10px;border-radius:50%;background:${navy};border:2px solid #93c5fd;position:absolute;left:-6px;top:3px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div>
              <strong style="font-size:${s.fontSize - 0.5}pt;color:${navy};">${e.degree}</strong><br>
              <span style="font-size:${s.fontSize - 1}pt;color:#64748b;">${e.school}</span>
            </div>
            <span style="font-size:8pt;color:#94a3b8;white-space:nowrap;margin-left:8px;">${e.dates}</span>
          </div>
        </div>`).join('')) : ''}
      ${cv.projects?.length ? mainSec('Projets', cv.projects.map(p =>
        `<div style="margin-bottom:8px;border:1px solid #e2e8f0;border-left:3px solid ${navy};padding:8px 10px;border-radius:4px;">
          <strong style="font-size:${s.fontSize - 0.5}pt;color:${navy};">${p.name}</strong>${p.dates ? `<span style="color:#94a3b8;font-size:8pt;"> · ${p.dates}</span>` : ''}
          <p style="margin:3px 0;font-size:${s.fontSize - 0.5}pt;color:#374151;">${p.description}</p>
          ${p.technologies ? `<p style="margin:0 0 3px 0;font-size:8pt;color:#64748b;font-style:italic;">${p.technologies}</p>` : ''}
          ${projectLink(p.url, navy)}
        </div>`).join('')) : ''}
      ${cv.certifications?.length ? mainSec('Certifications', cv.certifications.map(c =>
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
          <span style="color:${navy};font-size:10pt;">▸</span>
          <div><strong style="font-size:${s.fontSize - 0.5}pt;">${c.name}</strong>${c.issuer ? `<span style="color:#6b7280;font-size:${s.fontSize - 1}pt;"> · ${c.issuer}</span>` : ''}${c.date ? `<span style="color:#9ca3af;font-size:${s.fontSize - 1}pt;"> · ${c.date}</span>` : ''}</div>
        </div>`).join('')) : ''}
    </div>
  </div>
</div>`;
}

// ─── React wrappers ───────────────────────────────────────────────────────────
export function TemplateClassic({ cv }: { cv: CVData })        { return <div dangerouslySetInnerHTML={{ __html: buildClassicHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateModern({ cv }: { cv: CVData })         { return <div dangerouslySetInnerHTML={{ __html: buildModernHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateMinimal({ cv }: { cv: CVData })        { return <div dangerouslySetInnerHTML={{ __html: buildMinimalHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateExecutive({ cv }: { cv: CVData })      { return <div dangerouslySetInnerHTML={{ __html: buildExecutiveHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateCreative({ cv }: { cv: CVData })       { return <div dangerouslySetInnerHTML={{ __html: buildCreativeHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateDarkGold({ cv }: { cv: CVData })       { return <div dangerouslySetInnerHTML={{ __html: buildDarkGoldHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplatePhotoNoir({ cv }: { cv: CVData })      { return <div dangerouslySetInnerHTML={{ __html: buildPhotoNoirHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateEditorial({ cv }: { cv: CVData })      { return <div dangerouslySetInnerHTML={{ __html: buildEditorialHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateSplitPhoto({ cv }: { cv: CVData })     { return <div dangerouslySetInnerHTML={{ __html: buildSplitPhotoHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateGradientWarm({ cv }: { cv: CVData })   { return <div dangerouslySetInnerHTML={{ __html: buildGradientWarmHtml(cv, DEFAULT_CV_STYLE) }} />; }
export function TemplateCorporateBlue({ cv }: { cv: CVData })  { return <div dangerouslySetInnerHTML={{ __html: buildCorporateBlueHtml(cv, DEFAULT_CV_STYLE) }} />; }