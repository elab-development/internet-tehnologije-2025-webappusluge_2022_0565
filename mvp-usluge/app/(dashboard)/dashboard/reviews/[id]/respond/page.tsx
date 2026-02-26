"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function RespondToReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [review, setReview] = useState<any>(null);
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await fetch(`/api/reviews/${resolvedParams.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Greska pri učitavanju");

                setReview(data.data);
                if (data.data.response) setResponse(data.data.response);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReview();
    }, [resolvedParams.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            const res = await fetch(`/api/reviews/${resolvedParams.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ response })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Greška pri čuvanju odgovora");

            alert(data.message || "Odgovor uspešno sačuvan");
            router.push("/dashboard/bookings");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Učitavanje...</div>;
    }

    if (error && !review) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle>Odgovori na ocenu</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                    <div className="bg-gray-50 p-4 rounded mb-6">
                        <p className="text-sm font-semibold text-gray-800">
                            Ocena klijenta {review.author.firstName} {review.author.lastName}: {review.rating}/5
                        </p>
                        <p className="mt-2 text-gray-600 italic">
                            "{review.comment}"
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vaš odgovor</label>
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={4}
                                required
                                minLength={10}
                                maxLength={500}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                placeholder="Vaš odgovor u ime pružaoca usluge..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Odustani
                            </Button>
                            <Button type="submit" variant="primary" isLoading={isSaving}>
                                Sačuvaj odgovor
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
