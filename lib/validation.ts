// lib/validation.ts
import { z } from "zod";

export const userProfileSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
  title: z.string().min(3, "Le titre professionnel est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
  location: z.string().min(2, "Localisation requise"),
  summary: z.string().min(20).max(800),

  experiences: z.array(
    z.object({
      company: z.string().min(2),
      position: z.string().min(2),
      dates: z.string().min(3),
      description: z.string().min(10),
    })
  ).min(1),

  skills: z.array(z.string().min(1)).min(1),

  education: z.array(
    z.object({
      school: z.string().min(2),
      degree: z.string().min(2),
      dates: z.string().min(3),
    })
  ).min(1),

  projects: z.array(
    z.object({
      name: z.string().min(2),
      description: z.string().min(10),
      technologies: z.string().optional(),
      dates: z.string().optional(),
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

// Type INPUT : ce que react-hook-form gère (champs .default([]) sont optionnels en entrée)
export type UserProfileInput = z.input<typeof userProfileSchema>;

// Type OUTPUT : ce que Zod retourne après validation (tous les champs sont présents)
export type UserProfileForm = z.output<typeof userProfileSchema>;