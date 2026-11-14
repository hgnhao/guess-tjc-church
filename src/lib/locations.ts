import { normalizeLocations, type Location } from './game';

const base = import.meta.env.BASE_URL;

async function tryLoad(file: string): Promise<Location[]> {
  try {
    const res = await fetch(`${base}${file}`, { cache: 'no-cache' });
    if (!res.ok) return [];
    return normalizeLocations(await res.json());
  } catch {
    return [];
  }
}

/** Pakai public/locations.json; kalau tidak ada/kosong, fallback ke public/candidates.json. */
export async function loadLocations(): Promise<{ locations: Location[]; source: string }> {
  const main = await tryLoad('locations.json');
  if (main.length) return { locations: main, source: 'locations.json' };
  const fallback = await tryLoad('candidates.json');
  return { locations: fallback, source: 'candidates.json' };
}
