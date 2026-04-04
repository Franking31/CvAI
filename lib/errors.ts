// lib/errors.ts

export function parseApiError(errorMessage: string, provider: string): string {
  const msg = errorMessage.toLowerCase();

  // Quota / rate limit
  if (msg.includes('quota exceeded') || msg.includes('rate limit') || msg.includes('429')) {
    if (provider === 'gemini') {
      return `Quota Gemini gratuit dépassé. Solutions :\n- Attends quelques minutes et réessaie\n- Passe sur Groq (gratuit et sans limite stricte)\n- Ou mets à niveau ton compte Google AI Studio`;
    }
    return `Limite de requêtes atteinte sur ${provider}. Attends quelques secondes et réessaie.`;
  }

  // Clé API manquante ou invalide
  if (msg.includes('api key') || msg.includes('authentication') || msg.includes('unauthorized') || msg.includes('401')) {
    return `Clé API ${provider} invalide ou manquante. Vérifie ta variable d'environnement ${provider === 'gemini' ? 'GEMINI_API_KEY' : 'GROQ_API_KEY'} dans ton fichier .env.`;
  }

  // Modèle introuvable
  if (msg.includes('model') && (msg.includes('not found') || msg.includes('does not exist'))) {
    return `Le modèle sélectionné n'est pas disponible. Essaie un autre modèle dans le sélecteur en haut.`;
  }

  // Timeout
  if (msg.includes('timeout') || msg.includes('deadline')) {
    return `La requête a pris trop de temps. Réessaie ou choisis un modèle plus rapide.`;
  }

  // Contenu bloqué
  if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harmful')) {
    return `Le contenu a été bloqué par les filtres de sécurité. Reformule ta demande.`;
  }

  // Erreur JSON (réponse mal parsée)
  if (msg.includes('json') || msg.includes('parse') || msg.includes('unexpected token')) {
    return `Le modèle a retourné une réponse mal formatée. Réessaie — cela arrive parfois avec les petits modèles.`;
  }

  // Erreur réseau
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('econnrefused')) {
    return `Erreur réseau. Vérifie ta connexion internet.`;
  }

  // Fallback
  return `Une erreur est survenue. Réessaie ou change de modèle IA.`;
}