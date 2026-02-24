import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import Button from "@/components/ui/Button";

import BookingActions from "./BookingActions";

export default async function BookingsListPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const user = await requireAuth();
    if (!user) {
        redirect("/auth/login");
    }

    const { status } = await searchParams;

    const where: any =
        user.role === "CLIENT"
            ? { clientId: user.id }
            : { providerId: user.id };

    if (status && status !== "ALL") {
        where.status = status;
    }

    const bookings = await prisma.booking.findMany({
        where,
        orderBy: { scheduledDate: "desc" },
        include: {
            service: { select: { name: true, price: true } },
            client: { select: { firstName: true, lastName: true, phone: true } },
            provider: { select: { companyName: true, firstName: true, lastName: true } },
            review: { select: { id: true } },
        },
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800",
            CONFIRMED: "bg-blue-100 text-blue-800",
            COMPLETED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800",
            REJECTED: "bg-gray-100 text-gray-800",
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-2 inline-block">
                            ← Nazad na Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Sve rezervacije</h1>
                    </div>
                </div>

                <Card variant="elevated">
                    <CardHeader className="border-b">
                        <div className="flex gap-2">
                            <Link href="/dashboard/bookings">
                                <Button variant={!status || status === "ALL" ? "primary" : "outline"} size="sm">Sve</Button>
                            </Link>
                            <Link href="/dashboard/bookings?status=PENDING">
                                <Button variant={status === "PENDING" ? "primary" : "outline"} size="sm">Na čekanju</Button>
                            </Link>
                            <Link href="/dashboard/bookings?status=CONFIRMED">
                                <Button variant={status === "CONFIRMED" ? "primary" : "outline"} size="sm">Potvrđeno</Button>
                            </Link>
                            <Link href="/dashboard/bookings?status=COMPLETED">
                                <Button variant={status === "COMPLETED" ? "primary" : "outline"} size="sm">Završeno</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {bookings.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Nema pronađenih rezervacija.
                            </div>
                        ) : (
                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usluga</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                {user.role === "CLIENT" ? "Pružalac" : "Klijent"}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {booking.service.name}
                                                    <div className="text-xs text-gray-500">{Number(booking.service.price)} RSD</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {user.role === "CLIENT"
                                                        ? booking.provider.companyName || `${booking.provider.firstName} ${booking.provider.lastName}`
                                                        : `${booking.client.firstName} ${booking.client.lastName}`}
                                                    {user.role !== "CLIENT" && booking.client.phone && (
                                                        <div className="text-xs text-blue-500">{booking.client.phone}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(booking.scheduledDate)} u {booking.scheduledTime}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(booking.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <BookingActions
                                                        bookingId={booking.id}
                                                        status={booking.status}
                                                        role={user.role}
                                                        reviewId={booking.review?.id}
                                                    />
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
