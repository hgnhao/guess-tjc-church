import { useState, type FormEvent } from 'react';
import { NAME_MAX, ROOM_MAX, ROUND_SECONDS, normalizeName, normalizeRoom, DEFAULT_ROOM } from '../lib/game';
import { boardHref } from '../lib/hooks';

interface Props {
  defaultName: string;
  defaultRoom: string;
  rounds: number;
  /** Jumlah ronde untuk kode tertentu (kode sesi tetap bisa berbeda). */
  roundsFor?: (room: string) => number;
  status: 'loading' | 'ready' | 'error';
  onStart: (name: string, room: string) => void;
}

export default function Start({ defaultName, defaultRoom, rounds, roundsFor, status, onStart }: Props) {
  const [name, setName] = useState(defaultName);
  const [room, setRoom] = useState(defaultRoom || DEFAULT_ROOM);
  const [touched, setTouched] = useState(false);

  const cleanName = normalizeName(name);
  const cleanRoom = normalizeRoom(room) || DEFAULT_ROOM;
  const canStart = status === 'ready' && cleanName.length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (canStart) onStart(cleanName, cleanRoom);
  };

  return (
    <main className="start">
      <div className="start-inner">
        <div className="start-hero">
          <div className="start-globe" aria-hidden>
            🌏
          </div>
          <h1>
            Tebak Lokasi
            <span>Gereja Yesus Sejati</span>
          </h1>
          <p className="start-how">
            Kamu bakal &ldquo;diteleport&rdquo; ke depan salah satu gereja GYS di dunia. Lihat sekeliling, lalu taruh
            pin di peta. Makin dekat tebakanmu, makin gede poinnya!
          </p>
        </div>

        <form className="card start-form" onSubmit={submit} noValidate>
          <label className="field">
            <span>Nama</span>
            <input
              type="text"
              value={name}
              maxLength={NAME_MAX}
              autoComplete="nickname"
              enterKeyHint="next"
              placeholder="Nama kamu"
              onChange={(e) => setName(e.target.value)}
              aria-invalid={touched && !cleanName}
            />
            {touched && !cleanName && <small className="field-error">Isi nama dulu ya 🙏</small>}
          </label>
          <label className="field">
            <span>Kode Ruangan</span>
            <input
              type="text"
              value={room}
              maxLength={ROOM_MAX}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              onChange={(e) => setRoom(normalizeRoom(e.target.value))}
            />
            <small className="field-hint">Kode sama = lokasi sama untuk semua pemain.</small>
          </label>

          <button type="submit" className="btn btn-primary btn-big" disabled={status !== 'ready'}>
            {status === 'loading' ? 'Memuat lokasi…' : 'Mulai 🚀'}
          </button>
          {status === 'error' && (
            <p className="field-error center">Gagal memuat data lokasi. Cek koneksi internet lalu muat ulang halaman.</p>
          )}
          <p className="start-meta">
            {roundsFor ? roundsFor(cleanRoom) : rounds} ronde · {ROUND_SECONDS} detik per ronde · maks 5.000 poin per ronde
          </p>
        </form>

        <a className="link-board" href={boardHref(cleanRoom)}>
          🏆 Lihat Papan Skor
        </a>
      </div>
    </main>
  );
}
