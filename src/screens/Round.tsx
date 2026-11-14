import { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import GuessMap from '../components/GuessMap';
import { formatNumber, type LatLng } from '../lib/geo';
import { ROUND_SECONDS, type Location } from '../lib/game';
import { useMediaQuery } from '../lib/hooks';

/** Kalau event `load` iframe tidak datang, timer tetap mulai setelah sekian ms. */
const LOAD_FALLBACK_MS = 8000;
const LOW_TIME_SECONDS = 15;
/**
 * Fullscreen di dalam iframe Street View akan menyembunyikan overlay anti-bocor (kartu alamat
 * jadi terlihat). Karena iframe sudah memenuhi layar, default-nya dimatikan.
 */
const ALLOW_IFRAME_FULLSCREEN = false;

interface Props {
  location: Location;
  roundNo: number;
  totalRounds: number;
  totalScore: number;
  /** Deadline tersimpan (kalau halaman di-refresh di tengah ronde). */
  deadline: number | null;
  onTimerStart: (deadline: number) => void;
  onSubmit: (guess: LatLng | null) => void;
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Round({ location, roundNo, totalRounds, totalScore, deadline: savedDeadline, onTimerStart, onSubmit }: Props) {
  const isDesktop = useMediaQuery('(min-width: 900px) and (hover: hover) and (pointer: fine)');
  const [loaded, setLoaded] = useState(false);
  const [timerStarted, setTimerStarted] = useState(savedDeadline !== null);
  const [deadline, setDeadline] = useState<number | null>(savedDeadline);
  const [now, setNow] = useState(() => Date.now());
  const [guess, setGuess] = useState<LatLng | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sizeKey, setSizeKey] = useState(0);
  const submittedRef = useRef(false);
  const guessRef = useRef<LatLng | null>(null);
  guessRef.current = guess;

  const submit = useCallback(
    (g: LatLng | null) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onSubmit(g);
    },
    [onSubmit],
  );

  // Batas aman kalau iframe tidak pernah memicu `load`
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), LOAD_FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Timer mulai setelah Street View termuat
  useEffect(() => {
    if (!loaded || timerStarted) return;
    const d = Date.now() + ROUND_SECONDS * 1000;
    setTimerStarted(true);
    setDeadline(d);
    onTimerStart(d);
  }, [loaded, timerStarted, onTimerStart]);

  useEffect(() => {
    if (deadline === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [deadline]);

  const remaining = deadline === null ? ROUND_SECONDS : Math.max(0, Math.ceil((deadline - now) / 1000));

  // Waktu habis: kirim pin kalau ada, kalau tidak 0 poin
  useEffect(() => {
    if (deadline !== null && now >= deadline) submit(guessRef.current);
  }, [now, deadline, submit]);

  const low = deadline !== null && remaining <= LOW_TIME_SECONDS;
  const timer = (
    <span className={`timer${low ? ' low' : ''}`} aria-label={`Sisa waktu ${remaining} detik`}>
      ⏱ {formatClock(remaining)}
    </span>
  );

  const goButton = (
    <button type="button" className="btn btn-go btn-big" disabled={!guess} onClick={() => submit(guess)}>
      {guess ? 'Tebak! 🎯' : 'Tap peta untuk taruh pin'}
    </button>
  );

  return (
    <main className="round">
      <div className="sv-wrap">
        <iframe
          key={location.embed}
          className="sv-frame"
          src={location.embed}
          title="Street View"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen={ALLOW_IFRAME_FULLSCREEN}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div className="sv-loading">
            <div className="spinner" />
            <p>Memuat Street View…</p>
          </div>
        )}

        {/* HUD sekaligus overlay anti-bocor: menutup kartu alamat Google di pojok kiri atas */}
        <div className="hud">
          <div className="hud-row">
            <span className="hud-round">
              Ronde {roundNo}/{totalRounds}
            </span>
            {timer}
          </div>
          <div className="hud-score">
            Skor <b>{formatNumber(totalScore)}</b>
          </div>
        </div>
      </div>

      {isDesktop ? (
        <div
          className={`desk-panel${expanded ? ' expanded' : ''}`}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onClick={() => setExpanded(true)}
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && (e.propertyName === 'width' || e.propertyName === 'height')) {
              setSizeKey((k) => k + 1);
            }
          }}
        >
          <div className="desk-map">
            <GuessMap guess={guess} onGuess={setGuess} sizeKey={sizeKey} />
          </div>
          {goButton}
        </div>
      ) : (
        <>
          <div className="fab-wrap">
            <button type="button" className="btn btn-primary btn-big fab" onClick={() => setSheetOpen(true)}>
              🗺️ Tebak di Peta{guess ? ' · 📍' : ''}
            </button>
          </div>
          <BottomSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onOpened={() => setSizeKey((k) => k + 1)}
            title={guess ? 'Pin siap! Tap lagi untuk pindah' : 'Tap peta untuk taruh pin'}
            headerExtra={timer}
            footer={goButton}
          >
            <GuessMap guess={guess} onGuess={setGuess} sizeKey={sizeKey} />
          </BottomSheet>
        </>
      )}
    </main>
  );
}
