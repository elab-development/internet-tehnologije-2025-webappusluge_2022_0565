"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/Button";

export default function Navbar() {
    const { data: session, status } = useSession();

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Uslužna aplikacija
                        </Link>
                    </div>

                    {/* Središnji linkovi (vidljivi na većim ekranima) */}
                    <div className="hidden md:flex flex-1 justify-center px-2 space-x-6">
                        <Link href="/services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Pretraži Usluge
                        </Link>
                        {/* Opcionalni linkovi za budućnost */}
                        <Link href="/docs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Swagger
                        </Link>
                    </div>

                    {/* Desna strana - Auth kontrole */}
                    <div className="flex items-center space-x-4">
                        {status === "loading" ? (
                            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : status === "authenticated" && session?.user ? (
                            <>
                                <div className="hidden sm:flex items-center text-sm font-medium text-gray-700 mr-2">
                                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-2 font-bold">
                                        {session.user.name?.charAt(0)?.toUpperCase() || "K"}
                                    </span>
                                    <span>{session.user.name}</span>
                                </div>

                                {session.user.role === "ADMIN" ? (
                                    <Link href="/admin">
                                        <Button variant="outline" size="sm">Admin Panel</Button>
                                    </Link>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Link href="/dashboard">
                                            <Button variant="outline" size="sm">Kontrolna tabla</Button>
                                        </Link>
                                        <Link href="/dashboard/profile">
                                            <Button variant="outline" size="sm">Profil</Button>
                                        </Link>
                                        {(session.user.role === "FREELANCER" || session.user.role === "COMPANY") && (
                                            <Link href="/calendar">
                                                <Button variant="outline" size="sm">Kalendar</Button>
                                            </Link>
                                        )}
                                        {session.user.role === "COMPANY" && (
                                            <Link href="/workers">
                                                <Button variant="outline" size="sm">Radnici</Button>
                                            </Link>
                                        )}
                                    </div>
                                )}

                                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    Odjavi se
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">Prijava</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button variant="primary" size="sm">Registracija</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
