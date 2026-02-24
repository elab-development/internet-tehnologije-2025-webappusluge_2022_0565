import { formatPrice, cn } from '@/lib/utils';
import { calculateDistance, formatDistance } from '@/lib/geolocation';

describe('lib/utils', () => {
    describe('formatPrice', () => {
        it('should format price correctly', () => {
            expect(formatPrice(1500)).toBe('1.500,00\u00a0RSD');
            expect(formatPrice(1000.5)).toBe('1.000,50\u00a0RSD');
            expect(formatPrice(0)).toBe('0,00\u00a0RSD');
        });

        it('should handle negative prices', () => {
            expect(formatPrice(-500)).toBe('-500,00\u00a0RSD');
        });

        it('should handle large numbers', () => {
            expect(formatPrice(1000000)).toBe('1.000.000,00\u00a0RSD');
        });
    });

    describe('cn (className utility)', () => {
        it('should combine class names', () => {
            expect(cn('class1', 'class2')).toBe('class1 class2');
        });

        it('should filter out falsy values', () => {
            expect(cn('class1', false, null, undefined, 'class2')).toBe('class1 class2');
        });

        it('should handle empty input', () => {
            expect(cn()).toBe('');
        });
    });
});

describe('lib/geolocation', () => {
    describe('calculateDistance', () => {
        it('should calculate distance between two points', () => {
            // Beograd (44.8176, 20.4633) -> Novi Sad (45.2671, 19.8335)
            const distance = calculateDistance(44.8176, 20.4633, 45.2671, 19.8335);
            expect(distance).toBeGreaterThan(70);
            expect(distance).toBeLessThan(80);
        });

        it('should return 0 for same coordinates', () => {
            const distance = calculateDistance(44.8176, 20.4633, 44.8176, 20.4633);
            expect(distance).toBe(0);
        });

        it('should handle negative coordinates', () => {
            const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);
            expect(distance).toBeGreaterThan(0);
        });
    });

    describe('formatDistance', () => {
        it('should format distance in km', () => {
            expect(formatDistance(5.5)).toBe('5.5km');
            expect(formatDistance(10)).toBe('10km');
        });

        it('should format distance in meters for < 1km', () => {
            expect(formatDistance(0.5)).toBe('500m');
            expect(formatDistance(0.123)).toBe('123m');
        });

        it('should handle 0 distance', () => {
            expect(formatDistance(0)).toBe('0m');
        });
    });
});
