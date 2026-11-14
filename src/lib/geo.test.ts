import { describe, expect, it } from 'vitest';
import { formatDistance, haversineKm, nearestLng } from './geo';

describe('haversine', () => {
  // Pusat kota ke pusat kota ~905 km (angka "880" di brief adalah perkiraan kasar)
  it("Jakarta ke Singapura sekitar 880–910 km", () => {
    const km = haversineKm({ lat: -6.2088, lng: 106.8456 }, { lat: 1.3521, lng: 103.8198 });
    expect(km).toBeGreaterThan(860);
    expect(km).toBeLessThan(910);
  });
  it('titik sama = 0', () => {
    expect(haversineKm({ lat: 10, lng: 20 }, { lat: 10, lng: 20 })).toBe(0);
  });
  it('melewati garis bujur 180 tetap benar', () => {
    // Fiji (178°E) ke Samoa (-172°W): selisih bujur cuma 10°, bukan 350°
    const km = haversineKm({ lat: -17, lng: 178 }, { lat: -17, lng: -172 });
    expect(km).toBeGreaterThan(1000);
    expect(km).toBeLessThan(1100);
    expect(haversineKm({ lat: 0, lng: 179.5 }, { lat: 0, lng: -179.5 })).toBeCloseTo(111.2, 0);
  });
  it('titik antipodal sekitar setengah keliling bumi', () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })).toBeCloseTo(20015, -1);
  });
});

describe('format & util', () => {
  it('format jarak', () => {
    expect(formatDistance(1234.4)).toBe('1.234 km');
    expect(formatDistance(0.85)).toBe('850 m');
    expect(formatDistance(12)).toBe('12 km');
  });
  it('nearestLng', () => {
    expect(nearestLng(-170, 175)).toBe(190);
    expect(nearestLng(10, 20)).toBe(10);
  });
});
