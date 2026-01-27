"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "Greška u konfiguraciji servera",
    AccessDenied: "Pristup odbijen",
    Verification: "Token je istekao ili je nevažeći",
    Default: "Došlo je do greške pri autentifikaciji",
  };

  const message = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-center">Greška pri prijavi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">{message}</p>
        </CardContent>
        <CardFooter>
          <Link href="/auth/login" className="w-full">
            <Button variant="primary" fullWidth>
              Nazad na prijavu
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}