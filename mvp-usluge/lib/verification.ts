import { prisma } from '@/lib/db/prisma';

/**
 * Proverava i ažurira verifikacioni status za sva preduzeća.
 * Kriterijum za DObijanje: >= 50 završenih usluga I prosečna ocena >= 4.5
 * Kriterijum za GUBITAK: prosečna ocena < 4.0
 */
export async function checkAndUpdateCompanyVerification() {
    const companies = await prisma.user.findMany({
        where: { role: 'COMPANY' },
        include: {
            _count: {
                select: {
                    bookingsAsProvider: {
                        where: { status: 'COMPLETED' },
                    },
                },
            },
        },
    });

    const results = { verified: 0, revoked: 0 };

    for (const company of companies) {
        const completedBookings = company._count.bookingsAsProvider;
        const avgRating = company.averageRating ? Number(company.averageRating) : 0;

        // Provera da li ispunjava uslove za dobijanje verifikacije
        if (completedBookings >= 50 && avgRating >= 4.5 && !company.verifiedAt) {
            await prisma.user.update({
                where: { id: company.id },
                data: { verifiedAt: new Date() },
            });
            results.verified++;
            // TODO: Ovde možemo dodati slanje emaila "Čestitamo, postali ste verifikovani!"
        }
        // Provera da li gubi verifikaciju
        else if (company.verifiedAt && avgRating < 4.0) {
            await prisma.user.update({
                where: { id: company.id },
                data: { verifiedAt: null },
            });
            results.revoked++;
            // TODO: Email obaveštenje o gubitku statusa
        }
    }

    return results;
}
