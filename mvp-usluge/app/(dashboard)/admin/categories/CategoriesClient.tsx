"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    parentId: string | null;
    servicesCount: number;
    childrenCount: number;
    children: Category[];
}

export default function CategoriesClient() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form state
    const [id, setId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const [parentId, setParentId] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories?includeChildren=true');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch categories');
            }

            setCategories(data.data.categories);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setId(category.id);
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description || "");
        setIconUrl(category.iconUrl || "");
        setParentId(category.parentId || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setId(null);
        setName("");
        setSlug("");
        setDescription("");
        setIconUrl("");
        setParentId("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const url = id ? `/api/categories/${id}` : "/api/categories";
            const method = id ? "PATCH" : "POST";

            const payload: any = {
                name,
                slug,
            };
            if (description) payload.description = description;
            if (iconUrl) payload.iconUrl = iconUrl;
            if (parentId) payload.parentId = parentId;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Došlo je do greške");
            }

            alert(id ? "Kategorija uspešno izmenjena!" : "Kategorija uspešno dodata!");
            handleCancel();
            await fetchCategories();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovu kategoriju?')) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Došlo je do greške prilikom brisanja");
            }

            alert('Kategorija uspešno obrisana!');
            await fetchCategories();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const autoGenerateSlug = (value: string) => {
        setName(value);
        if (!id) {
            setSlug(
                value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '')
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle>{id ? "Izmeni kategoriju" : "Dodaj novu kategoriju"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Naziv"
                                value={name}
                                onChange={(e) => autoGenerateSlug(e.target.value)}
                                required
                            />
                            <Input
                                label="Slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                            />
                            <Input
                                label="Ikona (URL)"
                                value={iconUrl}
                                onChange={(e) => setIconUrl(e.target.value)}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Roditeljska kategorija</label>
                                <select
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg p-2 border"
                                >
                                    <option value="">Glavna (Nema roditelja)</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Opis</label>
                            <textarea
                                className="w-full border-gray-300 rounded-lg border p-2"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4 pt-2">
                            {id && (
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Poništi
                                </Button>
                            )}
                            <Button type="submit" variant="primary" isLoading={isSubmitting}>
                                {id ? "Sačuvaj izmene" : "Dodaj kategoriju"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card variant="bordered">
                <CardHeader>
                    <CardTitle>Postojeće kategorije</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {categories.map((cat) => (
                            <div key={cat.id} className="border rounded-lg p-4 bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {cat.iconUrl && (
                                            <img src={cat.iconUrl} alt={cat.name} className="w-8 h-8 rounded" />
                                        )}
                                        <div>
                                            <h3 className="font-bold text-lg">{cat.name} <span className="text-sm font-normal text-gray-500">({cat.slug})</span></h3>
                                            <p className="text-sm text-gray-600">{cat.servicesCount} usluga</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(cat)}>Izmeni</Button>
                                        <Button variant="outline" size="sm" className="text-red-600 border-red-200" onClick={() => handleDelete(cat.id)}>Obriši</Button>
                                    </div>
                                </div>
                                {cat.children && cat.children.length > 0 && (
                                    <div className="mt-4 ml-8 space-y-2 border-l-2 border-gray-100 pl-4">
                                        {cat.children.map((child) => (
                                            <div key={child.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                                <div className="flex items-center gap-3">
                                                    {child.iconUrl && (
                                                        <img src={child.iconUrl} alt={child.name} className="w-6 h-6 rounded" />
                                                    )}
                                                    <div>
                                                        <h4 className="font-medium">{child.name} <span className="text-sm font-normal text-gray-500">({child.slug})</span></h4>
                                                        <p className="text-xs text-gray-600">{child.servicesCount} usluga</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(child)}>Izmeni</Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200" onClick={() => handleDelete(child.id)}>Obriši</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <p className="text-gray-500 text-center py-4">Nema zapisa o kategorijama.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
