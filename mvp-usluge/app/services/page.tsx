"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import dynamic from 'next/dynamic';

// Dinamički import Map komponente (client-side only)
const Map = dynamic(() => import('@/components/ui/Map'), { ssr: false });

/**
 * Service Interface
 */
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: string;
  duration: number;
  locationType: string;
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
    role: string;
    averageRating: number | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    verifiedAt: string | Date | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  distance?: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  servicesCount: number;
  childrenCount: number;
  children: {
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
    servicesCount: number;
  }[];
}

/**
 * Services List Page (Client Component)
 * - useEffect za fetch podataka
 * - useState za search i filtere
 */
export default function ServicesPage() {
  // ============================================
  // STATE MANAGEMENT (useState hook)
  // ============================================
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // ============================================
  // FETCH SERVICES (initial load + fallback)
  // (Ovaj useEffect će odraditi inicijalni fetch kada nema filtera po kategoriji)
  // ============================================
  useEffect(() => {
    // Zatraži dozvolu za geolokaciju
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);

      let url = "/api/services";
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }

      // 🆕 Dodaj geolokacijske parametre
      if (userLocation) {
        params.append('latitude', userLocation.lat.toString());
        params.append('longitude', userLocation.lon.toString());
        params.append('radius', '50'); // 50km radijus
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Greška pri učitavanju usluga");
      }

      setServices(data.data.services);
      setFilteredServices(data.data.services);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepoznata greška");
    } finally {
      setIsLoading(false);
    }
  };

  // FETCH SERVICES
  useEffect(() => {
    fetchServices();
  }, [selectedCategory, userLocation]);

  // ============================================
  // SEARCH FILTER (useEffect hook)
  // ============================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.name.toLowerCase().includes(query)
    );

    setFilteredServices(filtered);
  }, [searchQuery, services]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getProviderName = (service: Service) => {
    return (
      service.provider.companyName ||
      `${service.provider.firstName} ${service.provider.lastName}`
    );
  };

  const getLocationBadge = (locationType: string) => {
    const styles = {
      ONSITE: { bg: "bg-blue-100", text: "text-blue-800", label: "Na lokaciji" },
      CLIENT_LOCATION: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Kod klijenta",
      },
      ONLINE: { bg: "bg-purple-100", text: "text-purple-800", label: "Online" },
    };

    const style = styles[locationType as keyof typeof styles] || styles.ONSITE;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>
    );
  };

  // ============================================
  // FETCH KATEGORIJA
  // ============================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?parentId=null");
        const data = await response.json();

        if (response.ok) {
          setCategories(data.data.categories);
        }
      } catch (err) {
        console.error("Greška pri učitavanju kategorija:", err);
      }
    };

    fetchCategories();
  }, []);

  // ============================================
  // FETCH USLUGA SA FILTEROM PO KATEGORIJI
  // ============================================
  // Duplicate fetchServices useEffect removed in favor of single fetching logic above


  // ============================================
  // RENDER - LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje usluga...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Greška</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              Pokušaj ponovo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // RENDER - MAIN CONTENT
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dostupne usluge
              </h1>
              <p className="text-gray-600 mt-1">
                Pronađite idealnu uslugu za vaše potrebe
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Nazad na početnu</Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <Input
              type="text"
              placeholder="Pretražite usluge po nazivu, opisu ili kategoriji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              fullWidth
            />
          </div>

          {/* View Mode Toggle */}
          <div className="mt-4 flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              📋 Lista
            </Button>
            <Button
              variant={viewMode === 'map' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              🗺 Mapa
            </Button>
          </div>

          {/* Category Filter */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Filtriraj po kategoriji:
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Sve kategorije
              </Button>

              {categories.map((category) => (
                <div key={category.id} className="relative group">
                  <Button
                    variant={
                      selectedCategory === category.id ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.iconUrl && (
                      <span className="mr-1">{category.iconUrl}</span>
                    )}
                    {category.name}
                    <span className="ml-1 text-xs opacity-70">
                      ({category.servicesCount})
                    </span>
                  </Button>

                  {/* Dropdown za podkategorije */}
                  {category.children.length > 0 && (
                    <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {category.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedCategory(child.id)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {child.iconUrl && (
                            <span className="mr-2">{child.iconUrl}</span>
                          )}
                          {child.name}
                          <span className="ml-1 text-xs text-gray-500">
                            ({child.servicesCount})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Pronađeno <strong>{filteredServices.length}</strong> usluga
            {searchQuery && ` za "${searchQuery}"`}
          </p>
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nema rezultata
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pokušajte sa drugačijim pojmom za pretragu
              </p>
            </CardContent>
          </Card>
        )}

        {/* Services Grid ili Mapa */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} variant="elevated" padding="none" hoverable>
                <CardHeader className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {service.category.name}
                      </CardDescription>
                    </div>
                    {getLocationBadge(service.locationType)}
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {service.description}
                  </p>

                  {/* Provider Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {getProviderName(service).charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getProviderName(service)}
                        </p>
                        {service.provider.verifiedAt && (
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <title>Verifikovano preduzeće</title>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {service.provider.city && (
                        <p className="text-xs text-gray-500">
                          {service.provider.city}
                        </p>
                      )}
                    </div>
                    {service.provider.averageRating && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {Number(service.provider.averageRating).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(Number(service.price))}
                      </p>
                      <p className="text-xs text-gray-500">
                        {service.pricingType === "HOURLY"
                          ? "po satu"
                          : "fiksno"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {service.duration} min
                      </p>
                      <p className="text-xs text-gray-500">trajanje</p>
                    </div>
                  </div>
                </CardContent>

                {/* 🆕 Dodaj prikaz udaljenosti ako postoji */}
                {
                  service.distance !== undefined && service.distance !== null && (
                    <div className="px-4 py-2 bg-blue-50 border-t">
                      <p className="text-sm text-blue-700">
                        📍 {service.distance < 1
                          ? `${Math.round(service.distance * 1000)}m`
                          : `${service.distance}km`} od vas
                      </p>
                    </div>
                  )
                }

                < CardFooter className="p-4 bg-gray-50" >
                  <Link href={`/services/${service.id}`} className="w-full">
                    <Button variant="primary" fullWidth>
                      Pogledaj detalje
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="w-full">
            <Map
              providers={filteredServices
                .filter(s => s.provider.latitude && s.provider.longitude)
                .map(s => ({
                  id: s.provider.id,
                  name: s.provider.companyName || `${s.provider.firstName} ${s.provider.lastName}`,
                  latitude: s.provider.latitude!,
                  longitude: s.provider.longitude!,
                  city: s.provider.city || undefined,
                  averageRating: s.provider.averageRating ? Number(s.provider.averageRating) : undefined,
                  servicesCount: filteredServices.filter(fs => fs.provider.id === s.provider.id).length,
                }))}
              height="600px"
            />
          </div>
        )
        }
      </div >
    </div >
  );
}