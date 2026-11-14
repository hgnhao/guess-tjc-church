import { haversineKm, wrapLng, type LatLng } from './geo';
import { hashString, mulberry32, shuffle } from './seed';

// ---- Konstanta game (ubah di sini) ----
export const ROUNDS = 10;
export const ROUND_SECONDS = 90;
export const MAX_POINTS = 5000;
export const FULL_SCORE_KM = 25;
export const SCORE_SCALE_KM = 2000;
export const DEFAULT_ROOM = 'TJC';
export const NAME_MAX = 20;
export const ROOM_MAX = 20;

export interface Location {
  id: string;
  country: string;
  name: string;
  lat: number;
  lng: number;
  embed: string;
  address?: string;
}

export interface RoundOutcome {
  locationId: string;
  guess: LatLng | null;
  km: number | null;
  points: number;
}

/** Poin per ronde: round(5000 × e^(−km/2000)); < 25 km = 5000 penuh; tidak menebak = 0. */
export function scoreFor(km: number | null): number {
  if (km === null || !Number.isFinite(km)) return 0;
  if (km < FULL_SCORE_KM) return MAX_POINTS;
  return Math.max(0, Math.min(MAX_POINTS, Math.round(MAX_POINTS * Math.exp(-km / SCORE_SCALE_KM))));
}

export function evaluateGuess(loc: Location, guess: LatLng | null): RoundOutcome {
  const km = guess ? haversineKm(guess, loc) : null;
  return { locationId: loc.id, guess, km, points: scoreFor(km) };
}

export function normalizeRoom(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, '').slice(0, ROOM_MAX);
}

export function normalizeName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
}

/** Seed angka dari kode ruangan. */
export function seedForRoom(room: string): number {
  return hashString(`tjc-geo:${normalizeRoom(room)}`);
}

/** Ambil src dari kode <iframe> kalau yang ditempel adalah HTML, dan pulihkan &amp;. */
export function normalizeEmbed(raw: unknown, lat: number, lng: number): string | null {
  let s = typeof raw === 'string' ? raw.trim() : '';
  const m = s.match(/src\s*=\s*["']([^"']+)["']/i);
  if (m) s = m[1];
  s = s.replace(/&amp;/g, '&');
  if (/^https:\/\/(maps\.google\.com|www\.google\.com)\//.test(s)) return s;
  if (!s && Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0&output=svembed`;
  }
  return null;
}

/** Normalisasi locations.json / candidates.json ke tipe Location. Entri rusak dibuang. */
export function normalizeLocations(raw: unknown): Location[] {
  if (!Array.isArray(raw)) return [];
  const out: Location[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const lat = Number(r.lat);
    const lng = Number(r.lng);
    const country = typeof r.country === 'string' ? r.country.trim() : '';
    const name = typeof r.name === 'string' ? r.name.trim() : '';
    if (!country || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90) continue;
    const embed = normalizeEmbed(r.embed, lat, lng);
    if (!embed) continue;
    let id = r.id !== undefined && r.id !== null && r.id !== '' ? String(r.id) : `${country}|${name}|${lat},${lng}`;
    while (seen.has(id)) id += '*';
    seen.add(id);
    out.push({
      id,
      country,
      name: name || 'Gereja Yesus Sejati',
      lat,
      lng: wrapLng(lng),
      embed,
      address: typeof r.address === 'string' ? r.address : undefined,
    });
  }
  return out;
}

const canonicalKey = (l: Location) => `${l.country}\u0000${l.name}\u0000${l.lat.toFixed(6)}\u0000${l.lng.toFixed(6)}\u0000${l.embed}`;

/**
 * Pilih lokasi untuk satu game secara deterministik dari kode ruangan.
 * Maksimal satu lokasi per negara; jumlah ronde = min(count, jumlah negara).
 * Urutan file input tidak berpengaruh (data diurutkan dulu).
 */
export function buildRounds(locations: readonly Location[], room: string, count = ROUNDS): Location[] {
  const rand = mulberry32(seedForRoom(room));
  const byCountry = new Map<string, Location[]>();
  for (const loc of locations) {
    const list = byCountry.get(loc.country) ?? [];
    list.push(loc);
    byCountry.set(loc.country, list);
  }
  const countries = [...byCountry.keys()].sort();
  for (const c of countries) byCountry.get(c)!.sort((a, b) => (canonicalKey(a) < canonicalKey(b) ? -1 : 1));
  const picked = shuffle(countries, rand).slice(0, Math.min(count, countries.length));
  return picked.map((c) => {
    const list = byCountry.get(c)!;
    return list[Math.floor(rand() * list.length)];
  });
}
