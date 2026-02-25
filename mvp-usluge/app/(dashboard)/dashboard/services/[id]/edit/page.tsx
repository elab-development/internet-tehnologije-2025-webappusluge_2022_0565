"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: "FIXED" | "HOURLY";
  duration: number;
  locationType: "ONSITE" | "CLIENT_LOCATION" | "ONLINE";
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    pricingType: "FIXED" as "FIXED" | "HOURLY",
    duration: "60",
    locationType: "ONSITE" as "ONSITE" | "CLIENT_LOCATION" | "ONLINE",
    categoryId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Proveravaj autentifikaciju
  useEffect(() => {
    if (status === "unauthenticated") {
      setError("Morate biti prijavljeni da biste videli ovu stranicu");
      setIsLoading(false);
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchService();
      fetchCategories();
    }
  }, [session?.user?.id, status, serviceId]);

  const fetchService = async () => {
    if (!serviceId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      const data = await response.json();

      if (response.ok) {
        setService(data.data);
        setFormData({
          name: data.data.name || "",
          description: data.data.description || "",
          price: data.data.price?.toString() || "",
          pricingType: data.data.pricingType || "FIXED",
          duration: data.data.duration?.toString() || "60",
          locationType: data.data.locationType || "ONSITE",
          categoryId: data.data.categoryId || "",
        });
      } else {
        setError(data.error || "Greška pri učitavanju usluge");
      }
    } catch (err) {
      setError("Greška pri učitavanju usluge");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data.data.categories || []);
      }
    } catch (err) {
      console.error("Greška pri učitavanju kategorija:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Greška pri ažuriranju usluge");
      }

      setSuccessMessage("Usluga je uspešno ažurirana!");
      setTimeout(() => {
        router.push("/dashboard/services");
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Greška pri ažuriranju usluge");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Provera autentifikacije i uloge
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="bordered" padding="lg" className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Pristup odbijen</h3>
            <p className="mt-2 text-gray-600">Morate biti prijavljeni da biste videli ovu stranicu</p>
            <Link href="/auth/login" className="mt-4 inline-block">
              <Button variant="primary">Prijavi se</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.user?.role && !["FREELANCER", "COMPANY"].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="bordered" padding="lg" className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Pristup odbijen</h3>
            <p className="mt-2 text-gray-600">Samo pružaoci usluga mogu pristupiti ovoj stranici</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button variant="primary">Nazad na dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje usluge...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="bordered" padding="lg" className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Usluga nije pronađena</h3>
            <p className="mt-2 text-gray-600">Usluga koju pokušavate da uredite ne postoji</p>
            <Link href="/dashboard/services" className="mt-4 inline-block">
              <Button variant="primary">Nazad na usluge</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Uredi Uslugu</h1>
              <p className="text-gray-600 mt-1">Ažurirajte detalje vaše usluge</p>
            </div>
            <Link href="/dashboard/services">
              <Button variant="outline">← Nazad na usluge</Button>
            </Link>
          </div>

      {/* Error */}
      {error && (
        <Card variant="bordered" padding="md">
          <CardContent className="text-red-600 text-center py-4">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {successMessage && (
        <Card variant="bordered" padding="md">
          <CardContent className="text-green-600 text-center py-4">
            ✅ {successMessage}
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Uredi {service.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Naziv */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naziv Usluge *
              </label>
              <Input
                type="text"
                placeholder="npr. Muško šišanje"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Opis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis *
              </label>
              <textarea
                placeholder="Detaljno opišite vašu uslugu..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Kategorija */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorija *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Izaberite kategoriju</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cena i Tip */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cena *
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tip Cene *
                </label>
                <select
                  value={formData.pricingType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricingType: e.target.value as "FIXED" | "HOURLY",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FIXED">Fiksna</option>
                  <option value="HOURLY">Po satu</option>
                </select>
              </div>
            </div>

            {/* Trajanje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trajanje (minuti) *
              </label>
              <Input
                type="number"
                placeholder="60"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                min="15"
                required
              />
            </div>

            {/* Tip Lokacije */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Lokacije *
              </label>
              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    locationType: e.target.value as "ONSITE" | "CLIENT_LOCATION" | "ONLINE",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ONSITE">Na mojoj lokaciji</option>
                <option value="CLIENT_LOCATION">Kod klijenta</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ažurira se..." : "Sačuvaj Izmene"}
              </Button>
              <Link href="/dashboard/services">
                <Button variant="outline" type="button">
                  Otkaži
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
