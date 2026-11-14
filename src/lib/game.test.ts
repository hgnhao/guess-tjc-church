import { describe, expect, it } from 'vitest';
import candidates from '../../public/candidates.json';
import { buildRounds, normalizeEmbed, normalizeLocations, scoreFor, ROUNDS } from './game';

const locs = normalizeLocations(candidates);

describe('skor', () => {
  it('0 km dan < 25 km = 5000', () => {
    expect(scoreFor(0)).toBe(5000);
    expect(scoreFor(24.9)).toBe(5000);
  });
  it('2000 km sekitar 1839', () => {
    expect(scoreFor(2000)).toBe(1839);
  });
  it('tidak pernah negatif, tidak menebak = 0', () => {
    expect(scoreFor(20015)).toBeGreaterThanOrEqual(0);
    expect(scoreFor(1e9)).toBe(0);
    expect(scoreFor(null)).toBe(0);
  });
});

describe('ronde', () => {
  it('data kandidat terbaca', () => {
    expect(locs.length).toBe((candidates as unknown[]).length);
  });
  it('kode sama = urutan sama; urutan file tidak berpengaruh', () => {
    const a = buildRounds(locs, 'TJC').map((l) => l.id);
    const b = buildRounds([...locs].reverse(), 'TJC').map((l) => l.id);
    expect(a).toEqual(b);
    expect(a.length).toBe(ROUNDS);
  });
  it('kode beda = urutan beda', () => {
    expect(buildRounds(locs, 'TJC').map((l) => l.id)).not.toEqual(buildRounds(locs, 'PEMUDA').map((l) => l.id));
  });
  it('tidak ada negara dobel', () => {
    for (const room of ['TJC', 'A', 'B', 'PEMUDA2026', 'X1', 'MALANG']) {
      const cs = buildRounds(locs, room).map((l) => l.country);
      expect(new Set(cs).size).toBe(cs.length);
    }
  });
  it('ronde mengikuti jumlah negara kalau kurang', () => {
    const few = locs.filter((l) => ['Indonesia', 'Japan', 'Kenya'].includes(l.country));
    const r = buildRounds(few, 'TJC');
    expect(r.length).toBe(3);
    expect(new Set(r.map((l) => l.country)).size).toBe(3);
  });
});

describe('normalisasi embed', () => {
  it('dua format URL diterima apa adanya', () => {
    const sv = 'https://maps.google.com/maps?layer=c&cbll=1,2&cbp=11,0,0,0,0&output=svembed';
    const pb = 'https://www.google.com/maps/embed?pb=!4v1!6m8!1m7!1sabc!2m2!1d1!2d2!3f0!4f0!5f0.8';
    expect(normalizeEmbed(sv, 1, 2)).toBe(sv);
    expect(normalizeEmbed(pb, 1, 2)).toBe(pb);
    expect(normalizeEmbed(`<iframe src="${pb}" width="600"></iframe>`, 1, 2)).toBe(pb);
  });
  it('field string lat/lng & tanpa id tetap jalan', () => {
    const r = normalizeLocations([{ country: 'Indonesia', name: 'X', lat: '-7.9', lng: '112.6', embed: '' }]);
    expect(r[0].lat).toBe(-7.9);
    expect(r[0].embed).toContain('output=svembed');
  });
});
