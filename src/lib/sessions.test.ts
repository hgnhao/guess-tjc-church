import { describe, expect, it } from 'vitest';
import locationsRaw from '../../public/locations.json';
import sessionsRaw from '../../public/sessions.json';
import { normalizeLocations, normalizeSessions, roundsForRoom, buildRounds, ROUNDS } from './game';

const locations = normalizeLocations(locationsRaw);
const sessions = normalizeSessions(sessionsRaw);

describe('sessions.json', () => {
  it('semua nama ada di locations.json', () => {
    const names = new Set(locations.map((l) => l.name));
    for (const [code, list] of Object.entries(sessions)) {
      expect(list.filter((n) => !names.has(n)), code).toEqual([]);
    }
  });

  for (const code of Object.keys(sessions)) {
    it(`${code}: ${ROUNDS} soal, negara tidak dobel, urutan sesuai file`, () => {
      const rounds = roundsForRoom(locations, code, sessions);
      expect(rounds.length).toBe(ROUNDS);
      expect(new Set(rounds.map((l) => l.country)).size).toBe(rounds.length);
      expect(rounds.map((l) => l.name)).toEqual(sessions[code]);
    });
  }

  it('tidak ada gereja yang terulang antar sesi', () => {
    const all = Object.values(sessions).flat();
    expect(new Set(all).size).toBe(all.length);
  });

  it('kode sesi tidak peka huruf besar/kecil; kode lain tetap acak', () => {
    expect(roundsForRoom(locations, 'tjc1', sessions).map((l) => l.name)).toEqual(sessions.TJC1);
    expect(roundsForRoom(locations, 'LAIN', sessions)).toEqual(buildRounds(locations, 'LAIN'));
  });
});
