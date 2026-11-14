import { useEffect, useState } from 'react';
import { formatDistance, formatNumber } from '../lib/geo';
import { DEFAULT_ROOM, ROOM_MAX, normalizeRoom } from '../lib/game';
import { boardHref } from '../lib/hooks';
import { fetchBoard, supabaseEnabled, type BoardEntry } from '../lib/supabase';

const POLL_MS = 5000;
const MEDALS = ['🥇', '🥈', '🥉'];

export default function Board({ room: roomParam }: { room: string }) {
  const room = normalizeRoom(roomParam) || DEFAULT_ROOM;
  const [rows, setRows] = useState<BoardEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [draftRoom, setDraftRoom] = useState(room);

  useEffect(() => setDraftRoom(room), [room]);

  useEffect(() => {
    if (!supabaseEnabled) return;
    let alive = true;
    let timer = 0;
    setRows(null);
    const tick = async () => {
      const data = await fetchBoard(room);
      if (!alive) return;
      if (data) {
        setRows(data);
        setError(false);
        setUpdatedAt(new Date());
      } else {
        setError(true);
      }
      timer = window.setTimeout(tick, POLL_MS);
    };
    void tick();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [room]);

  const joinUrl = `${window.location.origin}${window.location.pathname}`;

  return (
    <main className="board">
      <header className="board-head">
        <a className="btn btn-ghost board-back" href="#/">
          ← Game
        </a>
        <h1>🏆 Papan Skor</h1>
        <form
          className="board-room"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.hash = boardHref(normalizeRoom(draftRoom) || DEFAULT_ROOM);
          }}
        >
          <label>
            <span>Ruangan</span>
            <input
              value={draftRoom}
              maxLength={ROOM_MAX}
              autoCapitalize="characters"
              spellCheck={false}
              onChange={(e) => setDraftRoom(normalizeRoom(e.target.value))}
            />
          </label>
          <button type="submit" className="btn btn-secondary">
            Buka
          </button>
        </form>
      </header>

      <p className="board-join">
        Gabung: <b>{joinUrl.replace(/^https?:\/\//, '')}</b> · kode <b>{room}</b>
      </p>

      {!supabaseEnabled ? (
        <div className="card board-empty">
          <p>Papan skor online belum diatur.</p>
          <small>Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY lalu deploy ulang (lihat README).</small>
        </div>
      ) : rows === null ? (
        <div className="card board-empty">{error ? 'Gagal memuat papan skor, mencoba lagi…' : 'Memuat…'}</div>
      ) : rows.length === 0 ? (
        <div className="card board-empty">Belum ada skor di ruangan {room}. Ayo main! 🚀</div>
      ) : (
        <ol className="board-list">
          {rows.map((r) => (
            <li key={r.name.toLowerCase()} className={r.rank <= 3 ? `top top${r.rank}` : ''}>
              <span className="b-rank">{MEDALS[r.rank - 1] ?? r.rank}</span>
              <span className="b-name">{r.name}</span>
              <span className="b-score">
                <b>{formatNumber(r.score)}</b>
                <small>rata-rata {formatDistance(r.avg_km)}</small>
              </span>
            </li>
          ))}
        </ol>
      )}

      {supabaseEnabled && (
        <p className="board-foot">
          {error && rows ? '⚠️ Koneksi bermasalah, menampilkan data terakhir. ' : ''}
          Diperbarui otomatis tiap 5 detik
          {updatedAt ? ` · terakhir ${updatedAt.toLocaleTimeString('id-ID')}` : ''}
        </p>
      )}
    </main>
  );
}
