'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix za default Leaflet ikone u Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Provider {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    city?: string;
    averageRating?: number;
    servicesCount?: number;
}

interface MapProps {
    providers: Provider[];
    center?: [number, number];
    zoom?: number;
    height?: string;
    onMarkerClick?: (providerId: string) => void;
}

export default function Map({
    providers,
    center = [44.8176, 20.4633], // Default: Beograd
    zoom = 12,
    height = '500px',
    onMarkerClick,
}: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Inicijalizuj mapu samo jednom
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

            // Dodaj OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(mapRef.current);
        }

        // Očisti stare markere
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapRef.current?.removeLayer(layer);
            }
        });

        // Dodaj nove markere
        providers.forEach((provider) => {
            if (!provider.latitude || !provider.longitude || !mapRef.current) return;

            // Kreiraj custom ikonu sa ocenom
            const markerHtml = `
        <div style="
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #3b82f6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">
          ${provider.averageRating ? provider.averageRating.toFixed(1) : '★'}
        </div>
      `;

            const customIcon = L.divIcon({
                html: markerHtml,
                className: 'custom-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
            });

            const marker = L.marker([provider.latitude, provider.longitude], {
                icon: customIcon,
            }).addTo(mapRef.current);

            // Popup sa informacijama
            const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${provider.name}</h3>
          ${provider.city ? `<p style="color: #666; font-size: 14px;">📍 ${provider.city}</p>` : ''}
          ${provider.averageRating
                    ? `<p style="color: #f59e0b; font-size: 14px;">⭐ ${provider.averageRating.toFixed(1)}/5</p>`
                    : ''
                }
          ${provider.servicesCount
                    ? `<p style="color: #666; font-size: 14px;">💼 ${provider.servicesCount} usluga</p>`
                    : ''
                }
          <button 
            onclick="window.location.href='/services?providerId=${provider.id}'"
            style="
              margin-top: 8px;
              background: #3b82f6;
              color: white;
              padding: 6px 12px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
            "
          >
            Pogledaj usluge
          </button>
        </div>
      `;

            marker.bindPopup(popupContent);

            // Event listener za klik na marker
            if (onMarkerClick) {
                marker.on('click', () => {
                    onMarkerClick(provider.id);
                });
            }
        });

        // Prilagodi zoom da prikaže sve markere
        if (providers.length > 0) {
            const providersWithLocation = providers.filter((p) => p.latitude && p.longitude);
            if (providersWithLocation.length > 0) {
                const bounds = L.latLngBounds(
                    providersWithLocation.map((p) => [p.latitude, p.longitude] as [number, number])
                );
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        // Cleanup
        return () => {
            // Ne uništavaj mapu, samo očisti markere
        };
    }, [providers, center, zoom, onMarkerClick]);

    return (
        <div
            ref={mapContainerRef}
            style={{ height, width: '100%', borderRadius: '8px' }}
            className="shadow-lg"
        />
    );
}
