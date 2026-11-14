import { useEffect, useRef, useState } from 'react';
import ResultMap from '../components/ResultMap';
import { countryDisplay } from '../data/countries';
import { formatDistance, formatNumber } from '../lib/geo';
import { MAX_POINTS, type Location, type RoundOutcome } from '../lib/game';
import { boardHref } from '../lib/hooks';
import { loadJSON, saveJSON } from '../lib/storage';
import { fetchBoard, submitScore, supabaseEnabled } from '../lib/supabase';

/** Rata-rata jarak dihitung dari ronde yang ditebak; ronde tanpa tebakan dihitung 20.000 km. */
export const NO_GUESS_KM = 20000;

interface Props {
  room: string;
  name: string;
  seed: number;
  rounds: Location[];
  outcomes: RoundOutcome[];
  onPlayAgain: () => void;
  onHome: () => void;
}

type SendStatus = 'off' | 'sending' | 'sent' | 'already' | 'failed';

export default function Final({ room, name, seed, rounds, outcomes, onPlayAgain, onHome }: Props) {
  const total = outcomes.reduce((s, o) => s + o.points, 0);
  const avgKm = outcomes.length
    ? outcomes.reduce((s, o) => s + (o.km ?? NO_GUESS_KM), 0) / outcomes.length
    : 0;
  const missed = outcomes.filter((o) => !o.guess).length;
  const sentKey = `tjc-sent:${room}:${seed}:${name.toLowerCase()}`;

  const [status, setStatus] = useState<SendStatus>(supabaseEnabled ? 'sending' : 'off');
  const [rank, setRank] = useState<{ rank: number; of: number } | null>(null);
  const startedRef = useRef(false);

  const refreshRank = async () => {
    const board = await fetchBoard(room);
    if (!board) return;
    const me = board.find((r) => r.name.trim().toLowerCase() === name.toLowerCase());
    if (me) setRank({ rank: me.rank, of: board.length });
  };

  const send = async () => {
    setStatus('sending');
    const ok = await submitScore({
      room,
      name,
      score: total,
      avg_km: Math.min(25000, Math.round(avgKm)),
      rounds: outcomes.length,
    });
    if (ok) {
      saveJSON(sentKey, { score: total, at: Date.now() });
      setStatus('sent');
    } else {
      setStatus('failed');
    }
    await refreshRank();
  };

  useEffect(() => {
    if (!supabaseEnabled || startedRef.current) return;
    startedRef.current = true;
    if (loadJSON(sentKey)) {
      setStatus('already');
      void refreshRank();
    } else {
      void send();
    }
    // sekali saja saat layar akhir muncul
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pairs = rounds.slice(0, outcomes.length).map((loc, i) => ({
    answer: loc,
    guess: outcomes[i].guess,
    label: String(i + 1),
  }));

  return (
    <main className="final">
      <section className="final-hero">
        <p className="final-kicker">Selesai! 🎉 GG, {name}</p>
        <div className="final-score">{formatNumber(total)}</div>
        <p className="final-sub">dari {formatNumber(MAX_POINTS * outcomes.length)} poin</p>
        <div className="stats light">
          <div className="stat">
            <span>Rata-rata jarak</span>
            <b>{formatDistance(avgKm)}</b>
          </div>
          <div className="stat">
            <span>Ruangan</span>
            <b>{room}</b>
          </div>
          {rank && (
            <div className="stat">
              <span>Peringkat</span>
              <b>
                #{rank.rank}
                <small> / {rank.of}</small>
              </b>
            </div>
          )}
        </div>
        {missed > 0 && (
          <p className="final-note">
            {missed} ronde tidak ditebak (dihitung {formatNumber(NO_GUESS_KM)} km untuk rata-rata).
          </p>
        )}
        <SendLine status={status} onRetry={send} />
      </section>

      <section className="final-body">
        <div className="final-map">
          <ResultMap pairs={pairs} />
        </div>

        <ol className="round-list">
          {pairs.map((_, i) => {
            const loc = rounds[i];
            const o = outcomes[i];
            const c = countryDisplay(loc.country);
            return (
              <li key={loc.id}>
                <span className="rl-no">{i + 1}</span>
                <span className="rl-flag">{c.flag}</span>
                <span className="rl-main">
                  <b>{c.name}</b>
                  <small>{loc.name}</small>
                </span>
                <span className="rl-num">
                  <b>{formatNumber(o.points)}</b>
                  <small>{o.km === null ? 'tidak menebak' : formatDistance(o.km)}</small>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="final-actions">
          <a className="btn btn-primary btn-big" href={boardHref(room)}>
            🏆 Lihat Papan Skor
          </a>
          <button type="button" className="btn btn-secondary btn-big" onClick={onPlayAgain}>
            🔁 Main Lagi
          </button>
          <p className="final-note">
            Main lagi dengan kode <b>{room}</b> = lokasinya sama. Mau lokasi baru? Host tinggal ganti kode ruangan.
          </p>
          <button type="button" className="btn btn-ghost" onClick={onHome}>
            Ganti nama / kode ruangan
          </button>
        </div>
      </section>
    </main>
  );
}

function SendLine({ status, onRetry }: { status: SendStatus; onRetry: () => void }) {
  if (status === 'off') return null;
  if (status === 'sending') return <p className="send-line">Mengirim skor…</p>;
  if (status === 'sent') return <p className="send-line ok">✅ Skor terkirim ke papan skor</p>;
  if (status === 'already')
    return <p className="send-line ok">✅ Skormu di ruangan ini sudah tercatat dari permainan sebelumnya</p>;
  return (
    <p className="send-line bad">
      Skor tidak terkirim.{' '}
      <button type="button" className="linkish" onClick={onRetry}>
        Coba lagi
      </button>
    </p>
  );
}
