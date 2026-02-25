'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect } from 'react';

// Dinamički import Swagger UI (client-side only)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-600">Učitavanje dokumentacije...</div>
});

export default function ApiDocsPage() {
    useEffect(() => {
        // Suppress React.StrictMode warnings za swagger-ui-react
        // Problem: swagger-ui-react koristi zastarele lifecycle metode (UNSAFE_componentWillReceiveProps)
        // Ovo je poznat issue sa bibliotekom koja nije ažurirana
        const originalError = console.error;

        console.error = (...args: any[]) => {
            const errorString = args.join(' ').toString();

            // Ignoriši samo UNSAFE_componentWillReceiveProps warning od swagger-ui-react
            if (errorString.includes('UNSAFE_componentWillReceiveProps') ||
                errorString.includes('ModelCollapse')) {
                // Tiho ignoriši
                return;
            }

            // Sve ostale greške prosleđi dalje
            originalError(...args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">📚 API Dokumentacija</h1>
                    <p className="text-blue-100">
                        Kompletna REST API dokumentacija za MVP Usluge platformu
                    </p>
                </div>
            </div>

            {/* Swagger UI */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <SwaggerUI url="/api/docs" />
            </div>

        </div>
    );
}
