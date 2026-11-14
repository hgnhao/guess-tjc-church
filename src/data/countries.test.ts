import { describe, expect, it } from 'vitest';
import { COUNTRIES, isoToFlag } from './countries';

// Ambil semua file lokasi yang ada (locations.json dan/atau candidates.json)
const files = import.meta.glob<unknown>('../../public/{locations,candidates}.json', { eager: true, import: 'default' });

describe('countries.ts', () => {
  it('ada minimal satu file lokasi', () => {
    expect(Object.keys(files).length).toBeGreaterThan(0);
  });
  for (const [path, data] of Object.entries(files)) {
    it(`semua country di ${path.split('/').pop()} punya entri`, () => {
      const missing = [...new Set((data as { country: string }[]).map((d) => d.country))].filter((c) => !COUNTRIES[c]);
      expect(missing).toEqual([]);
    });
  }
  it('bendera dari ISO', () => {
    expect(isoToFlag('ID')).toBe('🇮🇩');
  });
});
