import { z } from "zod";
import { PricingType, LocationType } from "@prisma/client";

/**
 * Validaciona shema za kreiranje usluge
 */
export const createServiceSchema = z.object({
  name: z
    .string()
    .min(3, "Naziv mora imati minimum 3 karaktera")
    .max(100, "Naziv je predugačak"),

  description: z
    .string()
    .min(10, "Opis mora imati minimum 10 karaktera")
    .max(2000, "Opis je predugačak"),

  price: z
    .number()
    .positive("Cena mora biti pozitivna")
    .max(1000000, "Cena je prevelika"),

  pricingType: z
    .enum([PricingType.FIXED, PricingType.HOURLY])
    .default(PricingType.FIXED),

  duration: z
    .number()
    .int("Trajanje mora biti ceo broj")
    .min(15, "Minimum 15 minuta")
    .max(480, "Maksimum 8 sati"),

  locationType: z
    .enum([LocationType.ONSITE, LocationType.CLIENT_LOCATION, LocationType.ONLINE])
    .default(LocationType.ONSITE),

  categoryId: z
    .string()
    .uuid("Nevalidna kategorija"),

  images: z
    .array(z.string().url("Nevalidan URL slike"))
    .max(3, "Maksimum 3 slike")
    .optional()
    .default([]),
});

/**
 * Validaciona shema za izmenu usluge
 */
export const updateServiceSchema = createServiceSchema.partial();

/**
 * TypeScript tipovi
 */
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;