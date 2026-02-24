"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Nedostaje verifikacioni token.");
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage(data.message || "E-mail adresa je uspešno verifikovana.");
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verifikacija nije uspela.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Došlo je do greške na serveru.");
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card variant="elevated" className="max-w-md w-full">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">Verifikacija E-mail adrese</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    {status === "loading" && (
                        <div className="py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Verifikacija u toku...</p>
                        </div>
                    )}
                    {status === "success" && (
                        <div className="py-8">
                            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="mt-4 text-lg font-medium text-green-600">{message}</p>
                            <div className="mt-6">
                                <Link href="/auth/login">
                                    <Button variant="primary" fullWidth>Prijavite se</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="py-8">
                            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <p className="mt-4 text-lg font-medium text-red-600">{message}</p>
                            <div className="mt-6 space-y-3">
                                <Link href="/auth/register">
                                    <Button variant="outline" fullWidth>Pokušajte ponovo</Button>
                                </Link>
                                <Link href="/">
                                    <Button variant="ghost" fullWidth>Nazad na početnu</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Učitavanje...</p></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
