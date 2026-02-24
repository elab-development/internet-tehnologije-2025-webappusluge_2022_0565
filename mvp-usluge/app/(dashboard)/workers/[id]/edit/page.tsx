import { redirect, notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import WorkerForm from '../../WorkerForm';

export default async function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await requireRole([UserRole.COMPANY]);

    if (!user) {
        redirect('/auth/login');
    }

    const { id } = await params;

    const worker = await prisma.worker.findUnique({
        where: { id },
    });

    if (!worker) {
        notFound();
    }

    if (worker.companyId !== user.id) {
        redirect('/unauthorized');
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
                    <h1 className="text-3xl font-bold text-gray-900">
                        Izmeni radnika: {worker.firstName} {worker.lastName}
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <WorkerForm worker={worker} />
            </div>
        </div>
    );
}
