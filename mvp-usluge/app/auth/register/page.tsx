"use client";

import { useState, FormEvent } from "react";
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
import { UserRole } from "@prisma/client";

/**
 * Register Page
 * Koristi useState hook za form state i validaciju
 * Koristi useRouter hook za redirekciju nakon registracije
 */
export default function RegisterPage() {
  // ============================================
  // STATE MANAGEMENT (useState hook)
  // ============================================
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: UserRole.CLIENT,
    companyName: "",
    pib: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ============================================
  // HOOKS
  // ============================================
  const router = useRouter();

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Očisti error za to polje
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ============================================
  // CLIENT-SIDE VALIDACIJA
  // ============================================
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validacija
    if (!formData.email) {
      newErrors.email = "Email je obavezan";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Nevalidna email adresa";
    }

    // Password validacija
    if (!formData.password) {
      newErrors.password = "Lozinka je obavezna";
    } else if (formData.password.length < 6) {
      newErrors.password = "Lozinka mora imati minimum 6 karaktera";
    }

    // Confirm password validacija
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Lozinke se ne poklapaju";
    }

    // First name validacija
    if (!formData.firstName) {
      newErrors.firstName = "Ime je obavezno";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "Ime mora imati minimum 2 karaktera";
    }

    // Last name validacija
    if (!formData.lastName) {
      newErrors.lastName = "Prezime je obavezno";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Prezime mora imati minimum 2 karaktera";
    }

    // Phone validacija (opciono)
    if (formData.phone && !/^\+?[0-9]{9,15}$/.test(formData.phone)) {
      newErrors.phone = "Nevalidan format telefona";
    }

    // COMPANY specifična validacija
    if (formData.role === UserRole.COMPANY) {
      if (!formData.companyName) {
        newErrors.companyName = "Naziv preduzeća je obavezan";
      }
      if (!formData.pib) {
        newErrors.pib = "PIB je obavezan";
      } else if (!/^[0-9]{9}$/.test(formData.pib)) {
        newErrors.pib = "PIB mora imati 9 cifara";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setApiError("");

    try {
      // API poziv
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          role: formData.role,
          companyName: formData.companyName || undefined,
          pib: formData.pib || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Server error
        if (data.errors) {
          // Validation errors
          setErrors(data.errors);
        } else {
          setApiError(data.error || "Registracija nije uspela");
        }
        setIsLoading(false);
        return;
      }

      // Uspešna registracija
      alert("Registracija uspešna! Sada se možete prijaviti.");
      router.push("/auth/login");
    } catch (err) {
      setApiError("Došlo je do greške. Pokušajte ponovo.");
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <CardHeader>
              <CardTitle>Kreirajte nalog</CardTitle>
              <CardDescription>
                Popunite formu da biste se registrovali na platformu
              </CardDescription>
            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-6">
              {/* Global Error Message */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {apiError}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip naloga <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value={UserRole.CLIENT}>
                    Klijent - Tražim usluge
                  </option>
                  <option value={UserRole.FREELANCER}>
                    Samostalni radnik - Nudim usluge
                  </option>
                  <option value={UserRole.COMPANY}>
                    Preduzeće - Nudim usluge
                  </option>
                </select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ime"
                  name="firstName"
                  type="text"
                  placeholder="Marko"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={errors.firstName}
                  disabled={isLoading}
                  required
                  fullWidth
                />

                <Input
                  label="Prezime"
                  name="lastName"
                  type="text"
                  placeholder="Marković"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={errors.lastName}
                  disabled={isLoading}
                  required
                  fullWidth
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email adresa"
                  name="email"
                  type="email"
                  placeholder="vas@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  disabled={isLoading}
                  required
                  fullWidth
                />

                <Input
                  label="Telefon"
                  name="phone"
                  type="tel"
                  placeholder="+381 60 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                  disabled={isLoading}
                  helperText="Opciono"
                  fullWidth
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Lozinka"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  disabled={isLoading}
                  helperText="Minimum 6 karaktera"
                  required
                  fullWidth
                />

                <Input
                  label="Potvrdite lozinku"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                  required
                  fullWidth
                />
              </div>

              {/* Company Fields (conditional) */}
              {formData.role === UserRole.COMPANY && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-medium text-gray-900">
                    Informacije o preduzeću
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Naziv preduzeća"
                      name="companyName"
                      type="text"
                      placeholder="Moja Firma d.o.o."
                      value={formData.companyName}
                      onChange={handleInputChange}
                      error={errors.companyName}
                      disabled={isLoading}
                      required
                      fullWidth
                    />

                    <Input
                      label="PIB"
                      name="pib"
                      type="text"
                      placeholder="123456789"
                      value={formData.pib}
                      onChange={handleInputChange}
                      error={errors.pib}
                      disabled={isLoading}
                      helperText="9 cifara"
                      required
                      fullWidth
                    />
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label className="text-sm text-gray-700">
                  Slažem se sa{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:underline"
                  >
                    uslovima korišćenja
                  </Link>{" "}
                  i{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    politikom privatnosti
                  </Link>
                </label>
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
                {isLoading ? "Kreiranje naloga..." : "Registruj se"}
              </Button>

              {/* Divider */}
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Već imate nalog?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link href="/auth/login" className="w-full">
                <Button type="button" variant="outline" fullWidth>
                  Prijavite se
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}