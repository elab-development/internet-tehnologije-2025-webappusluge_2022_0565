import { prisma } from "@/lib/db/prisma";

/**
 * Izračunava i ažurira prosečnu ocenu korisnika
 */
export async function updateUserAverageRating(userId: string): Promise<void> {
  // Pronađi sve ocene koje je korisnik dobio
  const reviews = await prisma.review.findMany({
    where: { targetId: userId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    // Ako nema ocena, postavi na null
    await prisma.user.update({
      where: { id: userId },
      data: {
        averageRating: null,
        totalReviews: 0,
      },
    });
    return;
  }

  // Izračunaj prosek
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;

  // Ažuriraj korisnika
  await prisma.user.update({
    where: { id: userId },
    data: {
      averageRating: Math.round(average * 100) / 100, // Zaokruži na 2 decimale
      totalReviews: reviews.length,
    },
  });
}