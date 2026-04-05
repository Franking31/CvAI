// lib/validation.ts
import { z } from "zod";

// Schéma pour un lien social personnalisé
export const socialLinkSchema = z.object({
  label: z.string().min(2, "Le nom du lien est requis (ex: Behance, Site perso)"),
  url: z.string().url("L'URL doit être valide (commençant par https://)"),
});

// Validation des dates (plus flexible)
const dateSchema = z.string()
  .min(3, "La période est requise")
  .refine((val) => {
    const trimmed = val.trim();
    // Accepte : 2023, 2022-2025, Jan 2023 - Aujourd'hui, 2021 à 2024, etc.
    return /^\d{4}|\d{4}\s*[-–—]\s*(\d{4}|aujourd'hui|today|présent)/i.test(trimmed) ||
           trimmed.length >= 8;
  }, "Format de date invalide. Exemples : 2023, 2022-2025, Jan 2023 - Aujourd'hui");

export const userProfileSchema = z.object({
  // Informations personnelles
  fullName: z.string().min(2, "Le nom complet est requis"),
  title: z.string().min(3, "Le titre professionnel est requis"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phone: z.string()
    .min(8, "Le numéro de téléphone est trop court")
    .max(20, "Numéro de téléphone trop long"),
  location: z.string().min(2, "La localisation est requise"),

  // Résumé
  summary: z.string()
    .min(30, "Le résumé professionnel doit contenir au moins 30 caractères")
    .max(700, "Le résumé est trop long (maximum 700 caractères)"),

  // Liens principaux
  github: z.string()
    .url("URL GitHub invalide")
    .optional()
    .or(z.literal("")),

  linkedin: z.string()
    .url("URL LinkedIn invalide")
    .optional()
    .or(z.literal("")),

  portfolio: z.string()
    .url("URL du portfolio invalide")
    .optional()
    .or(z.literal("")),

  // Liens sociaux personnalisés
  socialLinks: z.array(socialLinkSchema).default([]),

  // Expériences (obligatoire)
  experiences: z.array(
    z.object({
      company: z.string().min(2, "Le nom de l'entreprise est requis"),
      position: z.string().min(3, "Le poste occupé est requis"),
      dates: dateSchema,
      description: z.string().min(20, "Décrivez vos missions et réalisations (minimum 20 caractères)"),
    })
  ).min(1, "Vous devez ajouter au moins une expérience professionnelle"),

  // Compétences
  skills: z.array(z.string().min(1, "Compétence vide"))
    .min(3, "Ajoutez au moins 3 compétences"),

  // Formation
  education: z.array(
    z.object({
      school: z.string().min(2, "Le nom de l'établissement est requis"),
      degree: z.string().min(2, "Le diplôme est requis"),
      dates: dateSchema,
    })
  ).min(1, "Vous devez ajouter au moins une formation"),

  // Projets (optionnel)
  projects: z.array(
    z.object({
      name: z.string().min(2, "Le nom du projet est requis"),
      description: z.string().min(15, "Décrivez le projet"),
      technologies: z.string().optional(),
      dates: dateSchema.optional(),
      url: z.string().url("URL invalide").optional().or(z.literal("")),
    })
  ).default([]),

  // Langues
  languages: z.array(
    z.object({
      language: z.string().min(2, "La langue est requise"),
      level: z.string().min(2, "Le niveau est requis (ex: Natif, B2, Intermédiaire)"),
    })
  ).default([]),

  // Certifications
  certifications: z.array(
    z.object({
      name: z.string().min(3, "Le nom de la certification est requis"),
      issuer: z.string().optional(),
      date: z.string().optional(),
    })
  ).default([]),

  // Centres d'intérêt
  interests: z.array(z.string().min(2)).default([]),
});

export type UserProfileInput = z.input<typeof userProfileSchema>;
export type UserProfileForm = z.output<typeof userProfileSchema>;