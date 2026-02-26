import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

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

interface WorkerCardProps {
    worker: Worker;
    onToggleActive: (id: string, currentStatus: boolean) => void;
    onDelete: (id: string) => void;
}

export default function WorkerCard({ worker, onToggleActive, onDelete }: WorkerCardProps) {
    return (
        <Card variant="elevated" padding="lg" hoverable>
            <CardContent>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">
                                {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {worker.firstName} {worker.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{worker.position}</p>
                        </div>
                    </div>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${worker.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {worker.isActive ? 'Aktivan' : 'Neaktivan'}
                    </span>
                </div>

                {/* Contact */}
                {(worker.email || worker.phone) && (
                    <div className="mb-4 space-y-1">
                        {worker.email && (
                            <p className="text-sm text-gray-600">📧 {worker.email}</p>
                        )}
                        {worker.phone && (
                            <p className="text-sm text-gray-600">📞 {worker.phone}</p>
                        )}
                    </div>
                )}

                {/* Specializations */}
                {worker.specializations.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Specijalizacije:</p>
                        <div className="flex flex-wrap gap-1">
                            {worker.specializations.map((spec, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                >
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Services */}
                {worker.services.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                            Usluge ({worker.services.length}):
                        </p>
                        <div className="text-xs text-gray-600">
                            {worker.services.slice(0, 2).map((s) => s.name).join(', ')}
                            {worker.services.length > 2 && ` +${worker.services.length - 2}`}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="mb-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                        📅 Aktivne rezervacije: <strong>{worker._count.bookings}</strong>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link href={`/workers/${worker.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" fullWidth>
                            Izmeni
                        </Button>
                    </Link>
                    <Button
                        variant={worker.isActive ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => onToggleActive(worker.id, worker.isActive)}
                    >
                        {worker.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                    </Button>
                    {!worker.isActive && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(worker.id)}
                        >
                            Obriši
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
