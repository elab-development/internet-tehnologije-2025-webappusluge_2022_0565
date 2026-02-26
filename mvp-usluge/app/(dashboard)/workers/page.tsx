import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import WorkersClient from './WorkersClient';

/**
 * Workers Page
 * Samo za COMPANY
 */
export default async function WorkersPage() {
    const user = await requireRole([UserRole.COMPANY]);

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Radnici</h1>
                            <p className="text-gray-600 mt-1">Upravljajte timom radnika</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/workers/calendar">
                                <Button variant="outline">📅 Kolektivni kalendar</Button>
                            </Link>
                            <Link href="/workers/new">
                                <Button variant="primary">+ Dodaj radnika</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <WorkersClient />
            </div>
        </div>
    );
}
