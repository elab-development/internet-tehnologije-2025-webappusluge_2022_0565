"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookingStatus } from "@prisma/client";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Booking {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  clientNotes?: string;
  providerNotes?: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
  };
  service: {
    id: string;
    name: string;
  };
}

const statusColors: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Na čekanju",
  CONFIRMED: "Potvrđena",
  COMPLETED: "Završena",
  CANCELLED: "Otkazana",
  REJECTED: "Odbijena",
};

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "ALL">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchBookings();
    }
  }, [status, session?.user?.role]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bookings");
      const data = await response.json();

      if (response.ok) {
        setBookings(data.data.bookings || []);
      } else {
        setError(data.error || "Greška pri učitavanju rezervacija");
      }
    } catch (err) {
      setError("Greška pri učitavanju rezervacija");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBooking = async (bookingId: string, bookingDate: string) => {
    if (
      !window.confirm(
        `Jeste li sigurni da želite obrisati rezervaciju od ${bookingDate}? Ova akcija se ne može poništiti.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Greška pri brisanju rezervacije");
        return;
      }

      setBookings(bookings.filter((b) => b.id !== bookingId));
      alert("Rezervacija je uspešno obrisana!");
    } catch (err) {
      console.error("Greška pri brisanju rezervacije:", err);
      alert("Greška pri brisanju rezervacije");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBookings =
    filterStatus === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  // Provera autentifikacije
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    session?.user?.role !== "ADMIN"
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="bordered" padding="lg" className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Pristup odbijen</h3>
            <p className="mt-2 text-gray-600">Samo administratori mogu pristupiti ovoj stranici</p>
            <Link href="/admin" className="mt-4 inline-block">
              <Button variant="primary">Nazad na admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upravljanje Rezervacijama</h1>
              <p className="text-gray-600 mt-1">Sve rezervacije na platformi</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">← Nazad na admin</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error */}
        {error && (
          <Card variant="bordered" padding="md" className="mb-6">
            <CardContent className="text-red-600 text-center py-4">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader>
            <CardTitle>Filteri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "ALL" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("ALL")}
              >
                Sve ({bookings.length})
              </Button>
              {Object.entries(statusLabels).map(([status, label]) => {
                const count = bookings.filter(
                  (b) => b.status === status
                ).length;
                return (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status as BookingStatus)}
                  >
                    {label} ({count})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Učitavanje rezervacija...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card variant="bordered" padding="lg">
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Nema rezervacija sa odabranim filterom</p>
            </CardContent>
          </Card>
        ) : (
          <Card variant="bordered" padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum & Vreme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usluga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klijent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pružalac
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div>
                          {new Date(booking.scheduledDate).toLocaleDateString(
                            "sr-RS"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.scheduledTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="font-medium">
                          {booking.client.firstName} {booking.client.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.client.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="font-medium">
                          {booking.provider.companyName ||
                            `${booking.provider.firstName} ${booking.provider.lastName}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.provider.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            statusColors[booking.status]
                          }`}
                        >
                          {statusLabels[booking.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {["CANCELLED", "REJECTED"].includes(booking.status) ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={deletingId === booking.id}
                            onClick={() =>
                              deleteBooking(
                                booking.id,
                                new Date(booking.scheduledDate).toLocaleDateString(
                                  "sr-RS"
                                )
                              )
                            }
                          >
                            {deletingId === booking.id
                              ? "Briše se..."
                              : "🗑️ Obriši"}
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Može se obrisati samo ako je otkazana/odbijena
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Summary */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>📊 Ukupno:</strong> {bookings.length} rezervacija |
            <strong className="ml-4">✅ Potvrđena:</strong>{" "}
            {bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length} |
            <strong className="ml-4">🗑️ Mogu se obrisati:</strong>{" "}
            {
              bookings.filter((b) =>
                ["CANCELLED", "REJECTED"].includes(
                  b.status
                )
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
}
