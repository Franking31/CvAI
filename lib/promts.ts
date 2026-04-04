export const generateCVPrompt = (profile: any, jobDescription: string): string => {
  return `Tu es un expert senior en recrutement et optimisation ATS avec 15 ans d'expérience.

━━━ OFFRE D'EMPLOI CIBLE ━━━
${jobDescription}

━━━ PROFIL BRUT DU CANDIDAT ━━━
${JSON.stringify(profile, null, 2)}

━━━ TA MISSION ━━━
Tu dois TRANSFORMER le profil brut en un CV ultra-ciblé pour CETTE offre spécifique.
Ce n'est PAS une simple copie du profil — c'est une réécriture stratégique.

ÉTAPE 1 — Analyse l'offre et identifie :
- Les compétences techniques exactes demandées (ex: React, Python, SQL...)
- Les soft skills valorisés (ex: leadership, communication, autonomie...)
- Le vocabulaire métier spécifique utilisé dans l'annonce
- Le niveau de séniorité attendu
- Les responsabilités clés du poste

ÉTAPE 2 — Adapte chaque section :

TITRE : Utilise EXACTEMENT le même intitulé de poste que dans l'offre (ou très proche).

RÉSUMÉ PROFESSIONNEL :
- Commence par mentionner le nombre d'années d'expérience dans le domaine
- Intègre 4-6 mots-clés exacts de l'offre
- Mentionne les technologies/méthodes phares de l'offre que le candidat maîtrise
- Termine par une proposition de valeur alignée sur les besoins de l'entreprise
- NE PAS copier le summary brut du profil — réécrire entièrement

EXPÉRIENCES :
- Pour chaque expérience, réécris les bullets en utilisant le vocabulaire de l'offre
- Commence chaque bullet par un verbe d'action fort (Développé, Piloté, Optimisé, Conçu...)
- Ajoute des métriques quand c'est possible (%, €, nombre d'utilisateurs, délais...)
- Mets en avant les responsabilités qui matchent les missions de l'offre
- NE PAS copier mot pour mot la description brute — reformuler avec les termes de l'offre

COMPÉTENCES :
- Mets en PREMIER les compétences directement mentionnées dans l'offre
- Supprime les compétences très peu pertinentes pour ce poste

PROJETS :
- Reformule les descriptions pour mettre en avant ce qui est pertinent pour l'offre
- Utilise le vocabulaire technique de l'offre quand applicable

Retourne UNIQUEMENT ce JSON valide, sans backticks, sans texte avant ou après :

{
  "fullName": "${profile.fullName}",
  "title": "intitulé exact du poste de l'offre",
  "contact": {
    "email": "${profile.email}",
    "phone": "${profile.phone}",
    "location": "${profile.location}"
  },
  "professionalSummary": "Résumé entièrement réécrit avec les mots-clés ATS de l'offre, NE PAS copier le résumé original",
  "experiences": [
    {
      "company": "nom entreprise",
      "position": "poste",
      "dates": "période",
      "bullets": [
        "Verbe d'action + réalisation reformulée avec vocabulaire de l'offre + résultat mesurable",
        "Autre réalisation ciblée sur les besoins du poste"
      ]
    }
  ],
  "skills": ["compétences triées par pertinence pour l'offre en premier"],
  "education": [
    { "school": "établissement", "degree": "diplôme", "dates": "période" }
  ],
  "projects": [
    {
      "name": "Nom du projet",
      "description": "Description reformulée pour ce qui est pertinent pour l'offre",
      "technologies": "tech1, tech2",
      "dates": "année"
    }
  ],
  "languages": [{ "language": "Français", "level": "Natif" }],
  "certifications": [{ "name": "Nom certification", "issuer": "Organisme", "date": "année" }],
  "interests": ["loisir1", "loisir2"]
}

Règles ABSOLUES :
- Projets : inclure TOUS les projets du profil, descriptions reformulées
- Langues : reprendre TOUTES les langues
- Loisirs : reprendre TOUS les centres d'intérêt
- Certifications : reprendre TOUTES les certifications
- Ne jamais inventer des expériences ou compétences que le candidat n'a pas
- Si une section est vide dans le profil, retourner un tableau vide []
- Le résumé et les bullets d'expérience DOIVENT être différents du profil brut
- Retourne UNIQUEMENT le JSON, rien d'autre.`;
};
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

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