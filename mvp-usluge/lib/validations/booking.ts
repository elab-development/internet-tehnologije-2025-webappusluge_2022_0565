import { z } from "zod";
import { BookingStatus } from "@prisma/client";

/**
 * Validaciona shema za kreiranje rezervacije
 */
export const createBookingSchema = z.object({
  serviceId: z
    .string()
    .uuid("Nevalidna usluga"),

  scheduledDate: z
    .string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Datum ne može biti u prošlosti"),

  scheduledTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Nevalidan format vremena (HH:MM)"),

  clientNotes: z
    .string()
    .max(500, "Napomena ne može biti duža od 500 karaktera")
    .optional(),

  workerId: z
    .string()
    .uuid("Nevalidan radnik")
    .optional(),
});

/**
 * Validaciona shema za izmenu statusa rezervacije
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum([
    BookingStatus.CONFIRMED,
    BookingStatus.REJECTED,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
  ]),

  providerNotes: z
    .string()
    .max(500, "Napomena ne može biti duža od 500 karaktera")
    .optional(),
});

/**
 * TypeScript tipovi
 */
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;