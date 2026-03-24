import { describe, it, expect } from 'vitest';
import { haversineKm } from '../src/services/geoService';

describe('haversineKm', () => {
    it('returns 0 for identical points', () => {
        expect(haversineKm([14.4378, 50.0755], [14.4378, 50.0755])).toBe(0);
    });

    it('is symmetric', () => {
        const prague: [number, number] = [14.4378, 50.0755];
        const brno: [number, number] = [16.6068, 49.1951];
        expect(haversineKm(prague, brno)).toBeCloseTo(haversineKm(brno, prague), 6);
    });

    it('calculates Prague → Brno (~184 km)', () => {
        const prague: [number, number] = [14.4378, 50.0755];
        const brno: [number, number] = [16.6068, 49.1951];
        expect(haversineKm(prague, brno)).toBeCloseTo(184, 0);
    });

    it('calculates London → Paris (~344 km)', () => {
        const london: [number, number] = [-0.1276, 51.5074];
        const paris: [number, number] = [2.3522, 48.8566];
        expect(haversineKm(london, paris)).toBeCloseTo(344, 0);
    });

    it('calculates antipodal points (~20015 km)', () => {
        const northPole: [number, number] = [0, 90];
        const southPole: [number, number] = [0, -90];
        expect(haversineKm(northPole, southPole)).toBeCloseTo(20015, 0);
    });

    it('returns a positive value for distinct points', () => {
        const a: [number, number] = [0, 0];
        const b: [number, number] = [1, 1];
        expect(haversineKm(a, b)).toBeGreaterThan(0);
    });
});
