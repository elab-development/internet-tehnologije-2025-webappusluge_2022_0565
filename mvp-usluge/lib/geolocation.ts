/**
 * Izračunava udaljenost između dve tačke koristeći Haversine formulu
 * @param lat1 - Latitude prve tačke
 * @param lon1 - Longitude prve tačke
 * @param lat2 - Latitude druge tačke
 * @param lon2 - Longitude druge tačke
 * @returns Udaljenost u kilometrima
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radijus Zemlje u km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Zaokruži na 1 decimalu
}

/**
 * Konvertuje stepene u radijane
 */
function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Formatuje udaljenost za prikaz
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km}km`;
}
