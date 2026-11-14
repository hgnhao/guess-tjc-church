import { normalizeLocations, normalizeSessions, type Location, type Sessions } from './game';

const base = import.meta.env.BASE_URL;

async function fetchJSON(file: string): Promise<unknown> {
  try {
    const res = await fetch(`${base}${file}`, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Pakai public/locations.json; kalau tidak ada/kosong, fallback ke public/candidates.json.
 * public/sessions.json (opsional) berisi daftar soal tetap per kode ruangan.
 */
export async function loadLocations(): Promise<{ locations: Location[]; sessions: Sessions; source: string }> {
  const [main, sessionsRaw] = await Promise.all([fetchJSON('locations.json'), fetchJSON('sessions.json')]);
  const sessions = normalizeSessions(sessionsRaw);
  const locs = normalizeLocations(main);
  if (locs.length) return { locations: locs, sessions, source: 'locations.json' };
  const fallback = normalizeLocations(await fetchJSON('candidates.json'));
  return { locations: fallback, sessions, source: 'candidates.json' };
}
