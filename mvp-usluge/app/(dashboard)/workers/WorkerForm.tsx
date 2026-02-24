'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface WorkerFormProps {
    worker?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        position: string;
        specializations: string[];
    };
}

export default function WorkerForm({ worker }: WorkerFormProps) {
    const router = useRouter();
    const isEdit = !!worker;

    const [formData, setFormData] = useState({
        firstName: worker?.firstName || '',
        lastName: worker?.lastName || '',
        email: worker?.email || '',
        phone: worker?.phone || '',
        position: worker?.position || '',
        specializations: worker?.specializations?.join(', ') || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Ime je obavezno';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Prezime je obavezno';
        }

        if (!formData.position.trim()) {
            newErrors.position = 'Pozicija je obavezna';
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Nevalidna email adresa';
        }

        if (formData.phone && !/^\+?[0-9]{9,15}$/.test(formData.phone)) {
            newErrors.phone = 'Nevalidan format telefona';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const url = isEdit ? `/api/workers/${worker.id}` : '/api/workers';
            const method = isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    specializations: formData.specializations
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    alert(data.error || 'Greška');
                }
                return;
            }

            alert(isEdit ? 'Radnik uspešno ažuriran!' : 'Radnik uspešno dodat!');
            router.push('/workers');
        } catch (err) {
            alert('Greška pri čuvanju');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card variant="elevated" padding="lg">
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Ime"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                            required
                            fullWidth
                        />

                        <Input
                            label="Prezime"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                            required
                            fullWidth
                        />
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            helperText="Opciono"
                            fullWidth
                        />

                        <Input
                            label="Telefon"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            helperText="Opciono"
                            fullWidth
                        />
                    </div>

                    {/* Position */}
                    <Input
                        label="Pozicija"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        error={errors.position}
                        helperText="Npr. Senior frizer, Manikir majstor..."
                        required
                        fullWidth
                    />

                    {/* Specializations */}
                    <Input
                        label="Specijalizacije"
                        name="specializations"
                        value={formData.specializations}
                        onChange={handleChange}
                        helperText="Odvojeno zarezom (npr. Šišanje, Farbanje, Feniranje)"
                        fullWidth
                    />

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Otkaži
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            fullWidth
                        >
                            {isEdit ? 'Sačuvaj izmene' : 'Dodaj radnika'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
