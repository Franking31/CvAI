// lib/validation.ts
import { z } from "zod";

export const socialLinkSchema = z.object({
  label: z.string().min(1, "Le nom du lien est requis"),
  url: z.string().url("URL invalide"),
});

export const userProfileSchema = z.object({
  // Champs obligatoires
  fullName: z.string().min(2, "Le nom complet est requis"),
  title: z.string().min(3, "Le titre professionnel est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
  location: z.string().min(2, "Localisation requise"),
  summary: z.string().min(20, "Résumé trop court").max(800, "Résumé trop long"),

  // Liens sociaux (optionnel mais extensible)
  github: z.string().url("URL GitHub invalide").optional().or(z.literal('')),
  linkedin: z.string().url("URL LinkedIn invalide").optional().or(z.literal('')),
  portfolio: z.string().url("URL Portfolio invalide").optional().or(z.literal('')),
  socialLinks: z.array(socialLinkSchema).default([]),

  // Obligatoires
  experiences: z.array(
    z.object({
      company: z.string().min(2, "Entreprise requise"),
      position: z.string().min(2, "Poste requis"),
      dates: z.string().min(3, "Période requise"),
      description: z.string().min(10, "Description requise"),
    })
  ).min(1, "Au moins une expérience est requise"),

  skills: z.array(z.string().min(1)).min(1, "Au moins une compétence est requise"),

  education: z.array(
    z.object({
      school: z.string().min(2, "Établissement requis"),
      degree: z.string().min(2, "Diplôme requis"),
      dates: z.string().min(3, "Période requise"),
    })
  ).min(1, "Au moins une formation est requise"),

  // Optionnels
  projects: z.array(
    z.object({
      name: z.string().min(2),
      description: z.string().min(10),
      technologies: z.string().optional(),
      dates: z.string().optional(),
      url: z.string().url("URL invalide").optional().or(z.literal('')),
    })
  ).default([]),

  languages: z.array(
    z.object({
      language: z.string().min(2),
      level: z.string().min(2),
    })
  ).default([]),

  certifications: z.array(
    z.object({
      name: z.string().min(2),
      issuer: z.string().optional(),
      date: z.string().optional(),
    })
  ).default([]),

  interests: z.array(z.string().min(1)).default([]),
});

export type UserProfileInput = z.input<typeof userProfileSchema>;
export type UserProfileForm = z.output<typeof userProfileSchema>;