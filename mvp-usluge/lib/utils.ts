// lib/utils.ts
import { prisma } from "@/lib/db/prisma";

/**
 * Utility za spajanje CSS klasa
 */
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Formatira cijenu (npr. 1200 -> "1.200,00 RSD")
 */
export function formatPrice(
  value: number,
  options: Intl.NumberFormatOptions = {}
) {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD", // promijeni u EUR/HRK/BAM po potrebi
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Izračunava i ažurira prosečnu ocenu korisnika
 */
export async function updateUserAverageRating(userId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { targetId: userId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        averageRating: null,
        totalReviews: 0,
      },
    });
    return;
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;

  await prisma.user.update({
    where: { id: userId },
    data: {
      averageRating: Math.round(average * 100) / 100,
      totalReviews: reviews.length,
    },
  });
}