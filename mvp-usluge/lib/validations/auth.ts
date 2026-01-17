import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * Validaciona shema za registraciju
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email("Nevalidna email adresa")
    .min(1, "Email je obavezan"),
  
  password: z
    .string()
    .min(6, "Lozinka mora imati minimum 6 karaktera")
    .max(100, "Lozinka je predugačka"),
  
  firstName: z
    .string()
    .min(2, "Ime mora imati minimum 2 karaktera")
    .max(50, "Ime je predugačko"),
  
  lastName: z
    .string()
    .min(2, "Prezime mora imati minimum 2 karaktera")
    .max(50, "Prezime je predugačko"),
  
  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Nevalidan format telefona")
    .optional(),
  
  role: z
    .enum([UserRole.CLIENT, UserRole.FREELANCER, UserRole.COMPANY])
    .default(UserRole.CLIENT),
  
  // Opciona polja za COMPANY
  companyName: z.string().min(2).max(100).optional(),
  pib: z.string().regex(/^[0-9]{9}$/, "PIB mora imati 9 cifara").optional(),
});

/**
 * Validaciona shema za login
 */
export const loginSchema = z.object({
  email: z.string().email("Nevalidna email adresa"),
  password: z.string().min(1, "Lozinka je obavezna"),
});

/**
 * TypeScript tipovi iz shema
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;