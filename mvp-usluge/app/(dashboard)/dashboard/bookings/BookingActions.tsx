"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface BookingActionsProps {
    bookingId: string;
    status: string;
    role: "CLIENT" | "FREELANCER" | "COMPANY" | "ADMIN";
    reviewId?: string | null;
}

export default function BookingActions({ bookingId, status, role, reviewId }: BookingActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (newStatus: string) => {
        if (!window.confirm(`Da li ste sigurni da želite da promenite status u ${newStatus}?`)) return;

        setLoading(newStatus);

        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Došlo je do greške");
            }

            alert("Status uspešno promenjen!");
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Jeste li sigurni da želite obrisati ovu rezervaciju? Ova akcija se ne može poništiti.")) return;

        setLoading("DELETE");

        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Došlo je do greške");
            }

            alert("Rezervacija je uspešno obrisana!");
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(null);
        }
    };

    if (role === "CLIENT") {
        if (status === "PENDING" || status === "CONFIRMED") {
            return (
                <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleAction("CANCELLED")}
                    isLoading={loading === "CANCELLED"}
                >
                    Otkaži
                </Button>
            );
        } else if (status === "CANCELLED" || status === "REJECTED") {
            return (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={loading === "DELETE"}
                >
                    🗑️ Obriši
                </Button>
            );
        } else if (status === "COMPLETED") {
            if (reviewId) {
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-600 hover:bg-gray-50"
                        onClick={() => router.push(`/dashboard/reviews/${reviewId}/edit`)}
                    >
                        Izmeni ocenu
                    </Button>
                );
            } else {
                return (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/dashboard/bookings/${bookingId}/review`)}
                    >
                        Oceni
                    </Button>
                );
            }
        }
    } else {
        // Provider roles
        if (status === "PENDING") {
            return (
                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction("CONFIRMED")}
                        isLoading={loading === "CONFIRMED"}
                    >
                        Prihvati
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleAction("REJECTED")}
                        isLoading={loading === "REJECTED"}
                    >
                        Odbij
                    </Button>
                </div>
            );
        } else if (status === "CONFIRMED") {
            return (
                <Button
                    variant="primary"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction("COMPLETED")}
                    isLoading={loading === "COMPLETED"}
                >
                    Završi uslugu
                </Button>
            );
        } else if (status === "COMPLETED") {
            if (reviewId) {
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-600 hover:bg-gray-50"
                        onClick={() => router.push(`/dashboard/reviews/${reviewId}/respond`)}
                    >
                        Odgovori na ocenu
                    </Button>
                );
            }
        }
    }

    return null;
}
