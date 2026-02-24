'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface WorkingHoursSlot {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

interface DaySchedule {
    dayOfWeek: number;
    dayName: string;
    slots: WorkingHoursSlot[];
}

export default function CalendarClient() {
    const [workingHours, setWorkingHours] = useState<DaySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [selectedDay, setSelectedDay] = useState(1); // Ponedeljak
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch working hours
    useEffect(() => {
        fetchWorkingHours();
    }, []);

    const fetchWorkingHours = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/calendar/working-hours');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch working hours');
            }

            setWorkingHours(data.data.workingHours);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWorkingHours = async (e: React.FormEvent) => {
        e.preventDefault();

        if (startTime >= endTime) {
            alert('Vreme početka mora biti pre vremena kraja');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch('/api/calendar/working-hours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dayOfWeek: selectedDay,
                    startTime,
                    endTime,
                    isActive: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add working hours');
            }

            // Refresh lista
            await fetchWorkingHours();

            // Reset form
            setStartTime('09:00');
            setEndTime('17:00');

            alert('Radno vreme uspešno dodato!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Greška pri dodavanju');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovo radno vreme?')) {
            return;
        }

        try {
            const response = await fetch(`/api/calendar/working-hours/${slotId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            // Refresh lista
            await fetchWorkingHours();
            alert('Radno vreme obrisano!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Greška pri brisanju');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Učitavanje kalendara...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Kalendar i radno vreme</h1>
                    <p className="text-gray-600 mt-1">Definišite svoje radno vreme za svaki dan u nedelji</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Forma za dodavanje */}
                    <Card variant="elevated" padding="lg">
                        <CardHeader>
                            <CardTitle>Dodaj radno vreme</CardTitle>
                            <CardDescription>Definiši kada si dostupan za rezervacije</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddWorkingHours} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dan u nedelji
                                    </label>
                                    <select
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={1}>Ponedeljak</option>
                                        <option value={2}>Utorak</option>
                                        <option value={3}>Sreda</option>
                                        <option value={4}>Četvrtak</option>
                                        <option value={5}>Petak</option>
                                        <option value={6}>Subota</option>
                                        <option value={0}>Nedelja</option>
                                    </select>
                                </div>

                                <Input
                                    label="Početak"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    fullWidth
                                />

                                <Input
                                    label="Kraj"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    fullWidth
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isSubmitting}
                                    fullWidth
                                >
                                    Dodaj radno vreme
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Prikaz radnog vremena */}
                    <div className="lg:col-span-2">
                        <Card variant="bordered" padding="lg">
                            <CardHeader>
                                <CardTitle>Vaše radno vreme</CardTitle>
                                <CardDescription>Pregled radnog vremena po danima</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {workingHours.map((day) => (
                                        <div
                                            key={day.dayOfWeek}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900">{day.dayName}</h3>
                                                {day.slots.length === 0 && (
                                                    <span className="text-sm text-gray-500">Neradni dan</span>
                                                )}
                                            </div>

                                            {day.slots.length > 0 && (
                                                <div className="space-y-2">
                                                    {day.slots.map((slot) => (
                                                        <div
                                                            key={slot.id}
                                                            className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded"
                                                        >
                                                            <span className="text-sm font-medium text-blue-900">
                                                                {slot.startTime} - {slot.endTime}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteSlot(slot.id)}
                                                                className="text-red-600 hover:text-red-700 text-sm"
                                                            >
                                                                Obriši
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
