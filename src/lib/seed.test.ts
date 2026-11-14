import { describe, expect, it } from 'vitest';
import { hashString, mulberry32, shuffle } from './seed';

describe('seed', () => {
  it('hash stabil', () => {
    expect(hashString('TJC')).toBe(hashString('TJC'));
    expect(hashString('TJC')).not.toBe(hashString('TJD'));
  });
  it('PRNG deterministik', () => {
    const a = mulberry32(42), b = mulberry32(42);
    for (let i = 0; i < 20; i++) expect(a()).toBe(b());
  });
  it('shuffle deterministik dan tidak kehilangan elemen', () => {
    const xs = Array.from({ length: 30 }, (_, i) => i);
    const s1 = shuffle(xs, mulberry32(7));
    const s2 = shuffle(xs, mulberry32(7));
    expect(s1).toEqual(s2);
    expect([...s1].sort((a, b) => a - b)).toEqual(xs);
  });
});
