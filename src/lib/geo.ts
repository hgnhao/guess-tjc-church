export interface LatLng {
  lat: number;
  lng: number;
}

export const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Jarak lingkaran besar (haversine) dalam km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Format angka dengan pemisah ribuan titik ala Indonesia: 12345 -> "12.345". */
export function formatNumber(n: number): string {
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return n < 0 ? `-${s}` : s;
}

/** "1.234 km", atau "850 m" kalau di bawah 1 km. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${formatNumber(km)} km`;
}

/** Bujur `lng` digeser ±360 supaya paling dekat ke `refLng` (untuk menggambar garis lewat garis bujur 180). */
export function nearestLng(lng: number, refLng: number): number {
  let out = lng;
  while (out - refLng > 180) out -= 360;
  while (out - refLng < -180) out += 360;
  return out;
}

/** Normalisasi bujur ke rentang [-180, 180). */
export function wrapLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}
