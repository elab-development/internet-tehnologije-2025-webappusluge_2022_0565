"use client";

import { useState } from "react";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Email sa uputstvom je uspešno poslat.");
                setEmail("");
            } else {
                setError(data.error || "Došlo je do greške.");
            }
        } catch (err: any) {
            setError(err.message || "Neuspešno slanje zahteva.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card variant="elevated" className="max-w-md w-full">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">Zaboravili ste lozinku?</CardTitle>
                </CardHeader>
                <CardContent>
                    {!message ? (
                        <>
                            <p className="text-center text-gray-600 mb-6">
                                Unesite vašu email adresu i poslaćemo vam link za resetovanje lozinke.
                            </p>

                            {error && (
                                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Email adresa"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="unesite@email.com"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={loading}
                                    fullWidth
                                >
                                    Pošalji link
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-4 text-green-600 font-medium">{message}</p>
                            <p className="mt-2 text-gray-500 text-sm">Proverite i vaš Nepoželjno/Spam folder ukoliko ne vidite email u Inboxu.</p>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
                            Nazad na prijavu
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
