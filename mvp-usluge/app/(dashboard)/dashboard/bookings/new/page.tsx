"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NewBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceId = searchParams?.get("serviceId");

    const [loading, setLoading] = useState(false);
    const [serviceData, setServiceData] = useState<any>(null);
    const [error, setError] = useState("");

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [workerId, setWorkerId] = useState("");

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    useEffect(() => {
        if (!serviceId) {
            setError("Nije izabrana usluga.");
            return;
        }

        const fetchService = async () => {
            try {
                const response = await fetch(`/api/services/${serviceId}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setServiceData(data.data);
            } catch (err: any) {
                setError(err.message || "Greška pri učitavanju usluge.");
            }
        };

        fetchService();
    }, [serviceId]);

    useEffect(() => {
        if (!date || !serviceData) {
            setAvailableSlots([]);
            setTime("");
            return;
        }

        const fetchSlots = async () => {
            setSlotsLoading(true);
            setSlotsError("");
            setAvailableSlots([]);
            setTime("");

            try {
                // api/calendar/availability?providerId=X&date=Y&duration=Z
                const response = await fetch(
                    `/api/calendar/availability?providerId=${serviceData.provider.id}&date=${date}&duration=${serviceData.duration}`
                );
                const data = await response.json();

                if (response.ok) {
                    if (data.data && data.data.availableSlots) {
                        setAvailableSlots(data.data.availableSlots);
                    } else if (data.message) {
                        setSlotsError(data.message);
                    }
                } else {
                    setSlotsError(data.error || "Greška pri učitavanju slobodnih termina.");
                }
            } catch (err) {
                setSlotsError("Nije moguće učitati termine.");
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [date, serviceData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!time) {
            setError("Obavezno je izabrati vreme.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const bodyPayload: any = {
                serviceId,
                scheduledDate: new Date(date).toISOString(),
                scheduledTime: time,
                clientNotes: notes
            };

            if (workerId) {
                bodyPayload.workerId = workerId;
            }

            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Došlo je do greške prilikom zakazivanja.");
            }

            alert("Upešno zakazano!");
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (error && !serviceData) {
        return <div className="p-8 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle>Zakaži termin</CardTitle>
                </CardHeader>
                <CardContent>
                    {serviceData ? (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold text-lg">{serviceData.name}</h3>
                            <p className="text-sm text-gray-600">
                                {serviceData.provider.companyName || `${serviceData.provider.firstName} ${serviceData.provider.lastName}`}
                            </p>
                        </div>
                    ) : (
                        <div className="animate-pulse h-16 bg-gray-200 rounded mb-6"></div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Izaberite datum"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required
                        />

                        {date && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Slobodni termini</label>
                                {slotsLoading ? (
                                    <div className="text-gray-500 text-sm">Učitavanje termina...</div>
                                ) : slotsError ? (
                                    <div className="text-red-500 text-sm">{slotsError}</div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setTime(slot)}
                                                className={`py-2 px-3 text-sm rounded border text-center transition-colors ${time === slot
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded border">Nema slobodnih termina za izabrani dan. Molimo izaberite drugi datum.</div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Napomena</label>
                            <textarea
                                className="w-full border-gray-300 rounded-lg"
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {serviceData && serviceData.workers && serviceData.workers.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Izaberi radnika (opciono)</label>
                                <select
                                    value={workerId}
                                    onChange={(e) => setWorkerId(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg p-2 border"
                                >
                                    <option value="">Bilo koji slobodan radnik</option>
                                    {serviceData.workers.map((worker: any) => (
                                        <option key={worker.id} value={worker.id}>
                                            {worker.firstName} {worker.lastName} {worker.position ? `(${worker.position})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="w-full"
                            >
                                Odustani
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={loading}
                                className="w-full"
                                disabled={!time || slotsLoading}
                            >
                                Potvrdi zakazivanje
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
