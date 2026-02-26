"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Lozinke se ne podudaraju.");
            return;
        }

        if (password.length < 6) {
            setError("Lozinka mora imati najmanje 6 karaktera.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Vaša lozinka je uspešno promenjena.");
            } else {
                setError(data.error || "Došlo je do greške.");
            }
        } catch (err: any) {
            setError("Došlo je do greške na serveru.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Card variant="elevated" className="max-w-md w-full">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl font-bold text-red-600">Neispravan link</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="mb-6">Ovaj link nije validan ili ne sadrži potreban token za resetovanje lozinke.</p>
                        <Link href="/auth/forgot-password">
                            <Button variant="primary" fullWidth>Pokušajte ponovo</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card variant="elevated" className="max-w-md w-full">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">Postavite novu lozinku</CardTitle>
                </CardHeader>
                <CardContent>
                    {!message ? (
                        <>
                            {error && (
                                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Nova lozinka"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="Najmanje 6 karaktera"
                                />

                                <Input
                                    label="Potvrdite novu lozinku"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="Ponovite lozinku"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={loading}
                                    fullWidth
                                >
                                    Sačuvaj lozinku
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="mt-4 text-green-600 font-medium text-lg">{message}</p>
                            <div className="mt-8">
                                <Link href="/auth/login">
                                    <Button variant="primary" fullWidth>Prijavite se</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Učitavanje...</p></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
