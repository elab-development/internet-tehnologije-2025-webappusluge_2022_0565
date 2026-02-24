import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import Link from "next/link";
import Button from "@/components/ui/Button";
import DashboardCharts from "./DashboardCharts";

/**
 * Dashboard Page (Server Component)
 * Zaštićena stranica - zahteva autentifikaciju
 * Prikazuje različit sadržaj zavisno od uloge korisnika
 */
export default async function DashboardPage() {
  // ============================================
  // AUTENTIFIKACIJA (Server-side)
  // ============================================
  const user = await requireAuth();

  if (!user) {
    redirect("/auth/login");
  }

  // ============================================
  // FETCH PODATAKA (Server-side)
  // ============================================

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { verifiedAt: true }
  });

  // Statistika za pružaoce (FREELANCER i COMPANY)
  let providerStats = null;
  if (user.role === "FREELANCER" || user.role === "COMPANY") {
    const [services, bookings, reviews] = await Promise.all([
      prisma.service.count({
        where: { providerId: user.id, isActive: true },
      }),
      prisma.booking.count({
        where: { providerId: user.id },
      }),
      prisma.review.count({
        where: { targetId: user.id },
      }),
    ]);

    providerStats = { services, bookings, reviews };
  }

  // Statistika za klijente (CLIENT)
  let clientStats = null;
  if (user.role === "CLIENT") {
    const [totalBookings, pendingBookings, completedBookings] =
      await Promise.all([
        prisma.booking.count({
          where: { clientId: user.id },
        }),
        prisma.booking.count({
          where: { clientId: user.id, status: "PENDING" },
        }),
        prisma.booking.count({
          where: { clientId: user.id, status: "COMPLETED" },
        }),
      ]);

    clientStats = { totalBookings, pendingBookings, completedBookings };
  }

  // Nedavne aktivnosti
  const recentBookings = await prisma.booking.findMany({
    where:
      user.role === "CLIENT"
        ? { clientId: user.id }
        : { providerId: user.id },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      service: {
        select: { name: true },
      },
      client: {
        select: { firstName: true, lastName: true },
      },
      provider: {
        select: { firstName: true, lastName: true, companyName: true },
      },
    },
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      REJECTED: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]
          }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                {dbUser?.verifiedAt && (
                  <svg className="w-6 h-6 text-blue-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <title>Verifikovano preduzeće</title>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Dobrodošli, {user.name}!{" "}
                <span className="text-sm text-gray-500">({user.role})</span>
              </p>
            </div>
            <div className="flex gap-2">
              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline">Admin Panel</Button>
                </Link>
              )}
              <Link href="/services">
                <Button variant="outline">Pregledaj usluge</Button>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="secondary">
                  Odjavi se
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Provider Stats */}
          {providerStats && (
            <>
              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Aktivne usluge
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {providerStats.services}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Ukupno rezervacija
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {providerStats.bookings}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Ocene
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {providerStats.reviews}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Client Stats */}
          {clientStats && (
            <>
              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Ukupno rezervacija
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {clientStats.totalBookings}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Na čekanju
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {clientStats.pendingBookings}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Završeno
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {clientStats.completedBookings}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts Section (samo za pružaoce) */}
        <DashboardCharts userRole={user.role} />

        {/* Recent Activity */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Nedavne aktivnosti</CardTitle>
                <CardDescription>
                  Pregled poslednjih 5 rezervacija
                </CardDescription>
              </div>
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm">Prikaži sve</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nema rezervacija
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Počnite sa zakazivanjem usluga
                </p>
                <div className="mt-6">
                  <Link href="/services">
                    <Button variant="primary">Pregledaj usluge</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usluga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {user.role === "CLIENT" ? "Pružalac" : "Klijent"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.role === "CLIENT"
                            ? booking.provider.companyName ||
                            `${booking.provider.firstName} ${booking.provider.lastName}`
                            : `${booking.client.firstName} ${booking.client.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.scheduledDate)} {booking.scheduledTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}