'use client';

import { useState, useEffect } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import WorkerCard from './WorkerCard';

interface Worker {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    position: string;
    specializations: string[];
    isActive: boolean;
    services: Array<{ id: string; name: string }>;
    _count: {
        bookings: number;
    };
}

export default function WorkersClient() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

    useEffect(() => {
        fetchWorkers();
    }, [filter]);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            let url = '/api/workers';

            if (filter === 'active') {
                url += '?isActive=true';
            } else if (filter === 'inactive') {
                url += '?isActive=false';
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch workers');
            }

            setWorkers(data.data.workers || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (workerId: string, currentStatus: boolean) => {
        if (!confirm(`Da li ste sigurni da želite da ${currentStatus ? 'deaktivirate' : 'aktivirate'} ovog radnika?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/workers/${workerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update');
            }

            await fetchWorkers();
            alert('Status radnika uspešno promenjen!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Greška');
        }
    };

    const handleDelete = async (workerId: string) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovog radnika? Ova akcija se ne može poništiti.')) {
            return;
        }

        try {
            const response = await fetch(`/api/workers/${workerId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            await fetchWorkers();
            alert('Radnik uspešno obrisan!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Greška');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <>
            {/* Filters */}
            <div className="mb-6 flex gap-2">
                <Button
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                >
                    Svi ({workers.length})
                </Button>
                <Button
                    variant={filter === 'active' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('active')}
                >
                    Aktivni
                </Button>
                <Button
                    variant={filter === 'inactive' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('inactive')}
                >
                    Neaktivni
                </Button>
            </div>

            {/* Workers Grid */}
            {workers.length === 0 ? (
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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nema radnika</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Počnite sa dodavanjem radnika u vaš tim
                        </p>
                        <div className="mt-6">
                            <Link href="/workers/new">
                                <Button variant="primary">+ Dodaj prvog radnika</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workers.map((worker) => (
                        <WorkerCard
                            key={worker.id}
                            worker={worker}
                            onToggleActive={handleToggleActive}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
