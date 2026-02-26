"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type User = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    _count?: {
        bookingsAsClient: number;
        bookingsAsProvider: number;
    };
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success && data.data && data.data.users) {
                setUsers(data.data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                setUsers(prev => prev.map(u =>
                    u.id === id ? { ...u, isActive: !currentStatus } : u
                ));
            } else {
                const data = await res.json();
                alert(data.error || 'Došlo je do greške');
            }
        } catch (error) {
            console.error(error);
            alert('Došlo je do greške prilikom promene statusa');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 border-t">
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Upravljanje Korisnicima</h1>
                        <p className="text-gray-600 mt-1">Pregled i administracija korisnika platforme</p>
                    </div>
                    <div>
                        <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition underline">
                            ← Nazad na Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Korisnik</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uloga</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum registracije</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcije</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {user.firstName || ''} {user.lastName || ''}
                                                {!user.firstName && !user.lastName && '-'}
                                            </span>
                                            <span className="text-sm text-gray-500">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-blue-50 text-blue-700">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Aktivan' : 'Neaktivan'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition ${user.isActive
                                                    ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                                    : 'text-green-700 bg-green-50 hover:bg-green-100'
                                                }`}
                                        >
                                            {user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Nema pronađenih korisnika.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
