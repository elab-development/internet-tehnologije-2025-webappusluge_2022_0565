"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card, {
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

/**
 * Service Details Interface
 */
interface ServiceDetails {
    id: string;
    name: string;
    description: string;
    price: number;
    pricingType: string;
    duration: number;
    locationType: string;
    isActive: boolean;
    provider: {
        id: string;
        firstName: string;
        lastName: string;
        companyName: string | null;
        role: string;
        averageRating: number | null;
        totalReviews: number;
        city: string | null;
        address: string | null;
        phone: string | null;
        bio: string | null;
        verifiedAt: string | null;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    };
    workers: {
        id: string;
        firstName: string;
        lastName: string;
        position: string | null;
        specializations: string[];
    }[];
}

export default function ServiceDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const resolvedParams = use(params);

    const [service, setService] = useState<ServiceDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/services/${resolvedParams.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Usluga nije pronađena");
                }

                setService(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Nepoznata greška");
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiceDetails();
    }, [resolvedParams.id]);

    const getProviderName = (service: ServiceDetails) => {
        return (
            service.provider.companyName ||
            `${service.provider.firstName} ${service.provider.lastName}`
        );
    };

    const getLocationBadge = (locationType: string) => {
        const styles = {
            ONSITE: { bg: "bg-blue-100", text: "text-blue-800", label: "Na lokaciji (Salon/Ordinacija)" },
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
                className={`px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}
            >
                {style.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Učitavanje podataka o usluzi...</p>
                </div>
            </div>
        );
    }

    if (error || !service) {
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
                        <p className="mt-2 text-sm text-gray-500">
                            {error || "Usluga nije pronađena"}
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                            <Button
                                variant="primary"
                                onClick={() => window.location.reload()}
                            >
                                Pokušaj ponovo
                            </Button>
                            <Link href="/services">
                                <Button variant="outline" fullWidth>
                                    Nazad na listu usluga
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Navigation */}
                <div className="mb-6">
                    <Link
                        href="/services"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Nazad na sve usluge
                    </Link>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Service Details (2/3 width) */}
                    <div className="md:col-span-2 space-y-6">
                        <Card variant="elevated" padding="lg">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900">
                                                {service.name}
                                            </h1>
                                            <Link
                                                href={`/services?categoryId=${service.category.id}`}
                                                className="text-blue-600 hover:underline font-medium text-sm mt-1 inline-block"
                                            >
                                                {service.category.name}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        {getLocationBadge(service.locationType)}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Opis usluge
                                </h3>
                                <div className="prose max-w-none text-gray-600">
                                    <p className="whitespace-pre-wrap">{service.description}</p>
                                </div>

                                {/* Additional Info Section */}
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-sm text-gray-500 font-medium mb-1">
                                            Trajanje
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {service.duration} minuta
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-sm text-gray-500 font-medium mb-1">
                                            Lokacija
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {service.locationType === "ONSITE" && "Kod pružaoca"}
                                            {service.locationType === "CLIENT_LOCATION" &&
                                                "Kod klijenta"}
                                            {service.locationType === "ONLINE" && "Online usluga"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Workers Section (If applicable) */}
                        {service.workers && service.workers.length > 0 && (
                            <Card variant="bordered" padding="lg">
                                <CardHeader>
                                    <CardTitle>Dostupni radnici za ovu uslugu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {service.workers.map((worker) => (
                                            <div
                                                key={worker.id}
                                                className="flex items-center gap-3 p-3 border rounded-xl bg-white"
                                            >
                                                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                                    {worker.firstName.charAt(0)}
                                                    {worker.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {worker.firstName} {worker.lastName}
                                                    </p>
                                                    {worker.position && (
                                                        <p className="text-xs text-gray-500">
                                                            {worker.position}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Provider Info & Action (1/3 width) */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <Card variant="elevated" padding="lg">
                            <CardContent className="p-0">
                                <div className="text-center mb-6">
                                    <p className="text-gray-500 text-sm font-medium mb-1">
                                        Cena usluge
                                    </p>
                                    <p className="text-4xl font-bold text-gray-900">
                                        {formatPrice(service.price)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {service.pricingType === "HOURLY" ? "po satu" : "fiksno"}
                                    </p>
                                </div>

                                {service.isActive ? (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        onClick={() => {
                                            // Ovdje bi vodilo ka /bookings/new?serviceId=...
                                            // Ali s obzirom da stranica mozda jos uvek nije tamo, mozemo ovako
                                            // alert("Funkcionalnost zakazivanja");
                                            router.push(`/dashboard/bookings/new?serviceId=${service.id}`);
                                        }}
                                        className="py-4 text-lg"
                                    >
                                        Zakaži odmah
                                    </Button>
                                ) : (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
                                        Ova usluga je trenutno nedostupna
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Provider Insights */}
                        <Card variant="bordered" padding="lg">
                            <CardContent className="p-0">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                    O pružaocu usluge
                                </h3>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl shadow-sm">
                                        🏢
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <h4 className="font-bold text-gray-900 text-lg">
                                                {getProviderName(service)}
                                            </h4>
                                            {service.provider.verifiedAt && (
                                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <title>Verifikovano preduzeće</title>
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        {service.provider.city && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                {service.provider.city}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {(service.provider.averageRating !== null && service.provider.averageRating !== undefined) && (
                                    <div className="flex items-center gap-2 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <svg
                                            className="w-5 h-5 text-yellow-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-bold text-gray-900">
                                            {Number(service.provider.averageRating).toFixed(1)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ({service.provider.totalReviews} recenzija)
                                        </span>
                                    </div>
                                )}

                                {service.provider.bio && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            "{service.provider.bio}"
                                        </p>
                                    </div>
                                )}

                                {(service.provider.phone || service.provider.address) && (
                                    <div className="space-y-2 pt-4 border-t">
                                        {service.provider.phone && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                📞 {service.provider.phone}
                                            </p>
                                        )}
                                        {service.provider.address && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                📍 {service.provider.address}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
