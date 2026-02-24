import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * @swagger
 * /api/geocode:
 *   post:
 *     summary: Konvertuje adresu u geografske koordinate
 *     description: Koristi Nominatim API (OpenStreetMap) za geocoding
 *     tags: [Geolocation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 example: "Knez Mihailova 15, Beograd"
 *     responses:
 *       200:
 *         description: Koordinate uspešno dobijene
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 44.8176
 *                     longitude:
 *                       type: number
 *                       example: 20.4633
 *                     displayName:
 *                       type: string
 *       404:
 *         description: Adresa nije pronađena
 */
export async function POST(req: NextRequest) {
    try {
        const { address } = await req.json();

        if (!address) {
            return errorResponse('Adresa je obavezna', 400);
        }

        // Poziv ka Nominatim API (OpenStreetMap)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
                q: address,
                format: 'json',
                limit: '1',
                addressdetails: '1',
            }),
            {
                headers: {
                    'User-Agent': 'MVP-Usluge/1.0', // Nominatim zahteva User-Agent
                },
            }
        );

        if (!response.ok) {
            return errorResponse('Greška pri geocoding-u', 500);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            return errorResponse('Adresa nije pronađena', 404);
        }

        const location = data[0];

        return successResponse({
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
            displayName: location.display_name,
        });
    } catch (error) {
        console.error('Geocoding error:', error);
        return errorResponse('Greška pri geocoding-u', 500);
    }
}
