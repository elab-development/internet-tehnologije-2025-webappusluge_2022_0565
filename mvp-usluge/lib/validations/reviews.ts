import { z } from "zod";

/**
 * Validaciona shema za kreiranje ocene
 */
export const createReviewSchema = z.object({
  bookingId: z
    .string()
    .uuid("Nevalidna rezervacija"),

  rating: z
    .number()
    .int("Ocena mora biti ceo broj")
    .min(1, "Minimalna ocena je 1")
    .max(5, "Maksimalna ocena je 5"),

  comment: z
    .string()
    .min(10, "Komentar mora imati minimum 10 karaktera")
    .max(500, "Komentar ne može biti duži od 500 karaktera")
    .optional(),
});

/**
 * Validaciona shema za odgovor pružaoca na ocenu
 */
export const respondToReviewSchema = z.object({
  response: z
    .string()
    .min(10, "Odgovor mora imati minimum 10 karaktera")
    .max(500, "Odgovor ne može biti duži od 500 karaktera"),
});

/**
 * Validaciona shema za izmenu ocene
 */
export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional(),

  comment: z
    .string()
    .min(10)
    .max(500)
    .optional(),
});

/**
 * TypeScript tipovi
 */
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type RespondToReviewInput = z.infer<typeof respondToReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;