import React from 'react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import AdminChartsClient from './AdminChartsClient';
import Link from 'next/link';
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
                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Globalna analitika platforme</p>
                    </div>
                    <div>
                        <Link href="/admin/users" className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none transition">
                            Upravljanje Korisnicima
                        </Link>
                    </div>
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
