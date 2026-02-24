import React from 'react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import Card, {
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/Card';
import dynamic from 'next/dynamic';

// Dinamički import chart komponenti
const BookingsChart = dynamic(() => import('@/components/charts/BookingsChart'), { ssr: false });
const RatingDistributionChart = dynamic(() => import('@/components/charts/RatingDistributionChart'), { ssr: false });
const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false });
const ServicesByCategoryChart = dynamic(() => import('@/components/charts/ServicesByCategoryChart'), { ssr: false });

/**
 * Admin Dashboard Page
 * Samo za ADMIN ulogu
 */
export default async function AdminDashboardPage() {
    // Zahteva ADMIN ulogu
    const user = await requireRole([UserRole.ADMIN]);

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Globalna analitika platforme</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                        📊 <strong>Napomena:</strong> Grafikoni se učitavaju dinamički sa servera.
                        Podaci se ažuriraju u realnom vremenu.
                    </p>
                </div>

                {/* Charts Grid */}
                <AdminChartsClient />
            </div>
        </div>
    );
}

/**
 * Client Component za fetch analytics podataka
 */
function AdminChartsClient() {
    'use client';

    const [analytics, setAnalytics] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/analytics');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch analytics');
                }

                setAnalytics(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Učitavanje analitike...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">Greška: {error}</p>
            </div>
        );
    }

    return (
        <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card variant="elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ukupno rezervacija</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {analytics?.metrics?.totalBookings || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ukupan prihod</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {new Intl.NumberFormat('sr-RS', {
                                        style: 'currency',
                                        currency: 'RSD',
                                        maximumFractionDigits: 0,
                                    }).format(analytics?.metrics?.totalRevenue || 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Prosečna ocena</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {analytics?.metrics?.averageRating?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Aktivne usluge</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {analytics?.metrics?.totalServices || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bookings Chart */}
                <Card variant="bordered" padding="lg">
                    <CardHeader>
                        <CardTitle>Rezervacije po mesecima</CardTitle>
                        <CardDescription>Poslednih 6 meseci</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics?.charts?.bookingsByMonth ? (
                            <BookingsChart data={analytics.charts.bookingsByMonth} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Nema podataka
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card variant="bordered" padding="lg">
                    <CardHeader>
                        <CardTitle>Distribucija ocena</CardTitle>
                        <CardDescription>Sve ocene na platformi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics?.charts?.ratingDistribution ? (
                            <RatingDistributionChart data={analytics.charts.ratingDistribution} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Nema podataka
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card variant="bordered" padding="lg">
                    <CardHeader>
                        <CardTitle>Prihod po mesecima</CardTitle>
                        <CardDescription>Ukupan prihod platforme</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics?.charts?.revenueByMonth ? (
                            <RevenueChart data={analytics.charts.revenueByMonth} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Nema podataka
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Services by Category */}
                <Card variant="bordered" padding="lg">
                    <CardHeader>
                        <CardTitle>Usluge po kategorijama</CardTitle>
                        <CardDescription>Distribucija aktivnih usluga</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics?.charts?.servicesByCategory && analytics.charts.servicesByCategory.length > 0 ? (
                            <ServicesByCategoryChart data={analytics.charts.servicesByCategory} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Nema podataka
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
