import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import WorkerForm from '../WorkerForm';

export default async function NewWorkerPage() {
    const user = await requireRole([UserRole.COMPANY]);

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/workers">
                            <Button variant="ghost" size="sm">
                                ← Nazad
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Dodaj novog radnika</h1>
                    <p className="text-gray-600 mt-1">Popunite informacije o radniku</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <WorkerForm />
            </div>
        </div>
    );
}
