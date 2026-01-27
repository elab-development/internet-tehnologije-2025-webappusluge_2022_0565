import { z } from "zod";

/**
 * Validaciona shema za kreiranje kategorije
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Naziv mora imati minimum 2 karaktera")
    .max(100, "Naziv je predugačak"),

  slug: z
    .string()
    .min(2, "Slug mora imati minimum 2 karaktera")
    .max(100, "Slug je predugačak")
    .regex(/^[a-z0-9-]+$/, "Slug može sadržati samo mala slova, brojeve i crtice"),

  description: z
    .string()
    .max(500, "Opis ne može biti duži od 500 karaktera")
    .optional(),

  iconUrl: z
    .string()
    .max(10, "Ikona može biti max 10 karaktera (emoji)")
    .optional(),

  parentId: z
    .string()
    .uuid("Nevalidna roditeljska kategorija")
    .optional()
    .nullable(),
});

/**
 * Validaciona shema za izmenu kategorije
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * TypeScript tipovi
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;