"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deactivating, setDeactivating] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        bio: "",
        city: "",
        address: "",
        companyName: "",
        pib: "",
        email: "",
        profileImage: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/profile");
                const data = await response.json();

                if (response.ok && data.data?.user) {
                    const user = data.data.user;
                    setFormData({
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        phone: user.phone || "",
                        bio: user.bio || "",
                        city: user.city || "",
                        address: user.address || "",
                        companyName: user.companyName || "",
                        pib: user.pib || "",
                        email: user.email || "",
                        profileImage: user.profileImage || ""
                    });
                } else {
                    setError("Neuspešno učitavanje profila.");
                }
            } catch (err) {
                setError("Došlo je do greške prilikom učitavanja.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const body = { ...formData };
            // @ts-ignore (email is read only)
            delete body.email;

            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Profil je uspešno ažuriran.");
            } else {
                setError(data.error || "Ažuriranje profila nije uspelo.");
            }
        } catch (err) {
            setError("Došlo je do greške prilikom čuvanja.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm("Da li ste sigurni da želite da deaktivirate vaš nalog? Akcija je trajna i zahteva kontaktiranje podrške za povratak.")) return;

        setDeactivating(true);
        try {
            const response = await fetch("/api/profile", { method: "DELETE" });
            if (response.ok) {
                alert("Vaš nalog je deaktiviran. Bićete odjavljeni.");
                router.push("/api/auth/signout");
            } else {
                const data = await response.json();
                setError(data.error || "Neuspešna deaktivacija.");
            }
        } catch (err) {
            setError("Greška prilikom deaktivacije.");
        } finally {
            setDeactivating(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Učitavanje profila...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Podešavanja Profila</h1>

            <Card variant="elevated">
                <CardHeader>
                    <CardTitle>Licni podaci</CardTitle>
                </CardHeader>
                <CardContent>
                    {message && (
                        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Ime"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Prezime"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="bg-gray-100"
                            />
                            <Input
                                label="Telefon"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <Input
                                label="Grad"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <Input
                                label="Adresa"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        {(formData.companyName || formData.pib || formData.profileImage !== undefined) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <Input
                                    label="Naziv preduzeća"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="PIB"
                                    name="pib"
                                    value={formData.pib}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Slika profila (URL)"
                                    name="profileImage"
                                    value={formData.profileImage}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="md:col-span-2"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Biografija / O meni</label>
                            <textarea
                                name="bio"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows={4}
                                value={formData.bio}
                                onChange={handleChange}
                            />
                            <p className="text-sm text-gray-500 mt-1">Napišite nešto o sebi i svojim uslugama kako bi klijenti stekli bolji utisak.</p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button type="submit" variant="primary" isLoading={saving}>
                                Sačuvaj izmene
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8">
                <Card variant="bordered" className="border-red-200">
                    <CardHeader className="bg-red-50 text-red-800 border-b border-red-100">
                        <CardTitle className="text-red-800">Opasna zona</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h4 className="font-medium text-gray-900">Deaktivacija naloga</h4>
                                <p className="text-sm text-gray-500 mt-1">Ova opcija će sakriti vaš profil i usluge. Vaši podaci neće biti trajno obrisani iz sigurnosnih razloga.</p>
                            </div>
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50 flex-shrink-0"
                                onClick={handleDeactivate}
                                isLoading={deactivating}
                            >
                                Deaktiviraj nalog
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
