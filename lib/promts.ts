// lib/promts.ts

export const generateCVPrompt = (profile: any, jobDescription: string): string => {
  return `Tu es un expert en recrutement, rédaction de CV et optimisation ATS.

Voici le profil COMPLET de l'utilisateur :
${JSON.stringify(profile, null, 2)}

Voici l'offre d'emploi cible :
${jobDescription}

Génère un CV parfaitement adapté. Retourne UNIQUEMENT ce JSON valide, sans backticks, sans texte avant ou après :

{
  "fullName": "${profile.fullName}",
  "title": "titre du poste adapté à l'offre",
  "contact": {
    "email": "${profile.email}",
    "phone": "${profile.phone}",
    "location": "${profile.location}"
  },
  "professionalSummary": "Résumé percutant de 4-5 lignes avec les mots-clés ATS de l'offre intégrés naturellement.",
  "experiences": [
    {
      "company": "nom entreprise",
      "position": "poste",
      "dates": "période",
      "bullets": ["action concrète + résultat mesurable", "autre réalisation"]
    }
  ],
  "skills": ["skill1", "skill2"],
  "education": [
    { "school": "établissement", "degree": "diplôme", "dates": "période" }
  ],
  "projects": [
    {
      "name": "Nom du projet",
      "description": "Description concise orientée résultats",
      "technologies": "tech1, tech2",
      "dates": "année"
    }
  ],
  "languages": [
    { "language": "Français", "level": "Natif" }
  ],
  "certifications": [
    { "name": "Nom certification", "issuer": "Organisme", "date": "année" }
  ],
  "interests": ["loisir1", "loisir2"]
}

Règles STRICTES :
- Projets : inclure TOUS les projets du profil (projects[]), adaptés à l'offre
- Langues : reprendre TOUTES les langues (languages[])
- Loisirs : reprendre TOUS les centres d'intérêt (interests[])
- Certifications : reprendre TOUTES les certifications (certifications[])
- Expériences : réécrire en action+résultat, trier par pertinence pour l'offre
- Si une section est vide dans le profil, retourner un tableau vide []
- Retourne UNIQUEMENT le JSON, rien d'autre.`;
};

// ─── Types partagés ───────────────────────────────────────────────────────────

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// ─── Gemini ───────────────────────────────────────────────────────────────────

type GeminiContent = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export function buildGeminiHistory(
  profile: any,
  jobDescription: string,
  history: ChatMessage[],
  newMessage: string
): { systemText: string; contents: GeminiContent[] } {
  const systemText = buildSystemPrompt(profile, jobDescription);

  const historyContents: GeminiContent[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return {
    systemText,
    contents: [...historyContents, { role: 'user', parts: [{ text: newMessage }] }],
  };
}

// ─── Groq (OpenAI-compatible) ─────────────────────────────────────────────────

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function buildGroqMessages(
  profile: any,
  jobDescription: string,
  history: ChatMessage[],
  newMessage: string
): OpenAIMessage[] {
  const systemText = buildSystemPrompt(profile, jobDescription);

  const historyMessages: OpenAIMessage[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  return [
    { role: 'system', content: systemText },
    ...historyMessages,
    { role: 'user', content: newMessage },
  ];
}

// ─── Prompt système partagé ───────────────────────────────────────────────────

function buildSystemPrompt(profile: any, jobDescription: string): string {
  return `Tu es CareerAI, expert RH et coach emploi. Tu aides à optimiser le CV.

${profile ? `PROFIL :
Nom : ${profile.fullName} | Titre : ${profile.title}
Compétences : ${profile.skills?.join(', ')}
Expériences : ${profile.experiences?.map((e: any) => `${e.position} chez ${e.company}`).join('; ')}
Projets : ${profile.projects?.map((p: any) => p.name).join(', ') || 'aucun'}
Langues : ${profile.languages?.map((l: any) => `${l.language} (${l.level})`).join(', ') || '-'}
Loisirs : ${profile.interests?.join(', ') || '-'}` : 'Profil non rempli.'}

${jobDescription ? `OFFRE CIBLE :\n${jobDescription.slice(0, 800)}` : "Pas d'offre."}

Règles : sois concis, pratique, réponds en français, maintiens la continuité.`;
}