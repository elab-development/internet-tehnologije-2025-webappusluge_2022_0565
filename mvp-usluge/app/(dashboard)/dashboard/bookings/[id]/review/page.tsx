"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function CreateReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: resolvedParams.id, // ID from URL
                    rating,
                    comment
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Greška pri čuvanju ocene");

            alert(data.message || "Ocena uspešno sačuvana");
            router.push("/dashboard/bookings");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle>Oceni uslugu</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ocena (1-5)</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                required
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                required
                                minLength={10}
                                maxLength={500}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                placeholder="Napišite svoje utiske o usluzi (najmanje 10 karaktera)..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Odustani
                            </Button>
                            <Button type="submit" variant="primary" isLoading={isLoading}>
                                Sačuvaj ocenu
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
