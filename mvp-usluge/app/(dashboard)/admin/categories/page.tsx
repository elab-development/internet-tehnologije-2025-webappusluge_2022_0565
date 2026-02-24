import React from 'react';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import CategoriesClient from './CategoriesClient';
import Link from 'next/link';

export const metadata = {
    title: 'Upravljanje kategorijama | Admin',
};

export default async function AdminCategoriesPage() {
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
                        <Link href="/admin" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 mb-2">
                            &larr; Nazad na Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Upravljanje kategorijama</h1>
                        <p className="text-gray-600 mt-1">Dodavanje, izmena i brisanje kategorija</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <CategoriesClient />
            </div>
        </div>
    );
}
