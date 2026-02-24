'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

// Dinamički import chart komponenti (client-side only)
const BookingsChart = dynamic(() => import('@/components/charts/BookingsChart'), { ssr: false });
const RatingDistributionChart = dynamic(() => import('@/components/charts/RatingDistributionChart'), { ssr: false });
const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false });

export default function DashboardCharts({ userRole }: { userRole: string }) {
    const [analytics, setAnalytics] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    useEffect(() => {
        // Fetch analytics samo za pružaoce
        if (userRole === 'FREELANCER' || userRole === 'COMPANY') {
            const fetchAnalytics = async () => {
                try {
                    setAnalyticsLoading(true);
                    const response = await fetch('/api/analytics');
                    const data = await response.json();

                    if (response.ok) {
                        setAnalytics(data.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch analytics:', error);
                } finally {
                    setAnalyticsLoading(false);
                }
            };

            fetchAnalytics();
        } else {
            setAnalyticsLoading(false);
        }
    }, [userRole]);

    // Render samo za pružaoce
    if (userRole !== 'FREELANCER' && userRole !== 'COMPANY') {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bookings Chart */}
            <Card variant="bordered" padding="lg">
                <CardHeader>
                    <CardTitle>Rezervacije po mesecima</CardTitle>
                    <CardDescription>Poslednih 6 meseci</CardDescription>
                </CardHeader>
                <CardContent>
                    {analyticsLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : analytics?.charts?.bookingsByMonth ? (
                        <BookingsChart data={analytics.charts.bookingsByMonth} />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            Nema podataka
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rating Distribution Chart */}
            <Card variant="bordered" padding="lg">
                <CardHeader>
                    <CardTitle>Distribucija ocena</CardTitle>
                    <CardDescription>Sve ocene</CardDescription>
                </CardHeader>
                <CardContent>
                    {analyticsLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : analytics?.charts?.ratingDistribution ? (
                        <RatingDistributionChart data={analytics.charts.ratingDistribution} />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            Nema podataka
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card variant="bordered" padding="lg" className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Prihod po mesecima</CardTitle>
                    <CardDescription>Poslednih 6 meseci (iz završenih rezervacija)</CardDescription>
                </CardHeader>
                <CardContent>
                    {analyticsLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : analytics?.charts?.revenueByMonth ? (
                        <RevenueChart data={analytics.charts.revenueByMonth} />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            Nema podataka
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
