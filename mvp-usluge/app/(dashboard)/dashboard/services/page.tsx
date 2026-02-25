"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";

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

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
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
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Proveravaj autentifikaciju
  useEffect(() => {
    if (status === "unauthenticated") {
      setError("Morate biti prijavljeni da biste videli ovu stranicu");
      setIsLoading(false);
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchServices();
      fetchCategories();
    }
  }, [session?.user?.id, status]);

  const fetchServices = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/services?providerId=${session.user.id}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.data.services || []);
      } else {
        setError(data.error || "Greška pri učitavanju usluga");
      }
    } catch (err) {
      setError("Greška pri učitavanju usluga");
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
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Greška pri kreiranju usluge");
      }

      // Resetuj formu
      setFormData({
        name: "",
        description: "",
        price: "",
        pricingType: "FIXED",
        duration: "60",
        locationType: "ONSITE",
        categoryId: "",
      });
      setShowForm(false);

      // Osveži listu
      await fetchServices();
      alert("Usluga je uspešno kreirana!");
    } catch (err: any) {
      setFormError(err.message || "Greška pri kreiranju usluge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleServiceActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setServices(
          services.map((s) =>
            s.id === serviceId ? { ...s, isActive: !currentStatus } : s
          )
        );
      }
    } catch (err) {
      console.error("Greška pri ažuriranju usluge:", err);
    }
  };

  const deleteService = async (serviceId: string, serviceName: string) => {
    if (!window.confirm(`Jeste li sigurni da želite obrisati uslugu "${serviceName}"? Ova akcija se ne može poništiti.`)) {
      return;
    }

    try {
      setDeletingServiceId(serviceId);
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Greška pri brisanju usluge");
        return;
      }

      // Ukloni uslugu iz liste
      setServices(services.filter((s) => s.id !== serviceId));
      alert("Usluga je uspešno obrisana!");
    } catch (err) {
      console.error("Greška pri brisanju usluge:", err);
      alert("Greška pri brisanju usluge");
    } finally {
      setDeletingServiceId(null);
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
          <p className="mt-4 text-gray-600">Učitavanje usluga...</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Moje Usluge</h1>
              <p className="text-gray-600 mt-1">Upravljajte vašim oglašenim uslugama</p>
            </div>
            <Button
              variant={showForm ? "outline" : "primary"}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Otkaži" : "+ Nova Usluga"}
            </Button>
          </div>

      {/* Error */}
      {error && (
        <Card variant="bordered" padding="md">
          <CardContent className="text-red-600 text-center py-4">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showForm && (
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Kreiraj Novu Uslugu</CardTitle>
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
                  {isSubmitting ? "Kreira se..." : "Kreiraj Uslugu"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Otkaži
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <Card variant="bordered" padding="lg">
          <CardContent className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0v-6m0 6v6"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nema usluga</h3>
            <p className="mt-1 text-sm text-gray-500">Kreirajte prvu uslugu da biste počeli</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} variant="elevated" padding="none" hoverable>
              <CardHeader className="p-4 border-b">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{service.category.name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      service.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {service.isActive ? "Aktivna" : "Neaktivna"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cena:</span>
                    <span className="font-semibold">
                      {formatPrice(service.price)} {service.pricingType === "HOURLY" ? "/sat" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trajanje:</span>
                    <span>{service.duration} minuta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lokacija:</span>
                    <span>
                      {service.locationType === "ONSITE"
                        ? "Na lokaciji"
                        : service.locationType === "CLIENT_LOCATION"
                        ? "Kod klijenta"
                        : "Online"}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 bg-gray-50 border-t flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Link href={`/dashboard/services/${service.id}/edit`} className="flex-1">
                    <Button variant="outline" fullWidth size="sm">
                      Uredi
                    </Button>
                  </Link>
                  <Button
                    variant={service.isActive ? "outline" : "primary"}
                    size="sm"
                    onClick={() => toggleServiceActive(service.id, service.isActive)}
                  >
                    {service.isActive ? "Deaktiviraj" : "Aktiviraj"}
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  disabled={deletingServiceId === service.id}
                  onClick={() => deleteService(service.id, service.name)}
                >
                  {deletingServiceId === service.id ? "Briše se..." : "🗑️ Obriši"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
