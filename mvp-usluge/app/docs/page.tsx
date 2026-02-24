'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dinamički import Swagger UI (client-side only)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
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
