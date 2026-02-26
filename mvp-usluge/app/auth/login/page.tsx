"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

/**
 * Login Page
 * Koristi useState hook za form state
 * Koristi useRouter hook za redirekciju
 */
export default function LoginPage() {
  // ============================================
  // STATE MANAGEMENT (useState hook)
  // ============================================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // HOOKS
  // ============================================
  const router = useRouter();

  // ============================================
  // CLIENT-SIDE VALIDACIJA
  // ============================================
  const validateForm = (): boolean => {
    // Reset error
    setError("");

    // Email validacija
    if (!email) {
      setError("Email je obavezan");
      return false;
    }

    if (!email.includes("@")) {
      setError("Nevalidna email adresa");
      return false;
    }

    // Password validacija
    if (!password) {
      setError("Lozinka je obavezna");
      return false;
    }

    if (password.length < 6) {
      setError("Lozinka mora imati minimum 6 karaktera");
      return false;
    }

    return true;
  };

  // ============================================
  // FORM SUBMIT HANDLER
  // ============================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validacija
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // NextAuth signIn
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Pogrešan email ili lozinka");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // ✅ Uspešna prijava - čekaj da se session stabilizuje na serveru
        // Ovo je KRITIČNO na Vercel-u gde je getServerSession() spora
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Prvo osvežи stranicu da učita nove cookies iz server session-a
        router.refresh();

        // Čekaj da se refresh završi i session bude dostupan
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Zatim redirektuj na dashboard
        // Sada će getServerSession() imati dostupan token
        router.push("/dashboard");

        // Nikad se ne dostiže kod ispod
        return;
      }

      // Ako ovde stignes, znači da nema error-a niti ok rezultata
      // To je retko, ali dodaj fallback
      setError("Neuspešna prijava - pokušajte ponovo");
      setIsLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError("Došlo je do greške. Pokušajte ponovo.");
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <CardHeader>
              <CardTitle>Prijava na sistem</CardTitle>
              <CardDescription>
                Unesite svoje kredencijale za pristup platformi
              </CardDescription>
            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-4">
              {/* Global Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Email Input */}
              <Input
                label="Email adresa"
                type="email"
                placeholder="vas@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                fullWidth
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />

              {/* Password Input */}
              <Input
                label="Lozinka"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                fullWidth
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Zapamti me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Zaboravili ste lozinku?
                </Link>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex-col gap-3">
              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                fullWidth
              >
                {isLoading ? "Prijavljivanje..." : "Prijavi se"}
              </Button>

              {/* Divider */}
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Nemate nalog?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <Link href="/auth/register" className="w-full">
                <Button type="button" variant="outline" fullWidth>
                  Registrujte se
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        {/* Test Credentials */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">
            🔑 Test kredencijali:
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              <strong>Admin:</strong> admin@mvp.com / admin123
            </p>
            <p>
              <strong>Klijent:</strong> marko@gmail.com / marko123
            </p>
            <p>
              <strong>Freelancer:</strong> petar@frizer.com / petar123
            </p>
            <p>
              <strong>Preduzeće:</strong> info@beautysalon.com / beauty123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}