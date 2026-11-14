import ResultMap from '../components/ResultMap';
import { countryDisplay } from '../data/countries';
import { formatDistance, formatNumber } from '../lib/geo';
import { MAX_POINTS, type Location, type RoundOutcome } from '../lib/game';

interface Props {
  location: Location;
  outcome: RoundOutcome;
  roundNo: number;
  totalRounds: number;
  totalScore: number;
  onNext: () => void;
}

export function verdict(o: RoundOutcome): string {
  if (!o.guess) return 'Waktu habis ⏰ Ronde depan gas lebih cepat!';
  if (o.points >= 4950) return 'Tepat sasaran! 🎯 Kamu jemaat sini ya?';
  if (o.points >= 4000) return 'Mantap, dekat banget! 🔥';
  if (o.points >= 2500) return 'Lumayan! Udah di jalur yang benar 👍';
  if (o.points >= 1000) return 'Hmm, masih satu benua lah ya 😅';
  return 'Jauh juga… tapi semangat! 🌏';
}

export default function RoundResult({ location, outcome, roundNo, totalRounds, totalScore, onNext }: Props) {
  const c = countryDisplay(location.country);
  const last = roundNo >= totalRounds;
  return (
    <main className="result">
      <div className="result-map">
        <ResultMap pairs={[{ answer: location, guess: outcome.guess }]} />
      </div>
      <section className="result-card">
        <div className="result-kicker">
          Ronde {roundNo}/{totalRounds}
        </div>
        <h2 className="result-country">
          <span className="flag">{c.flag}</span> {c.name}
        </h2>
        <p className="result-church">{location.name}</p>
        <div className="stats">
          <div className="stat">
            <span>Jarak</span>
            <b>{outcome.km === null ? '—' : formatDistance(outcome.km)}</b>
          </div>
          <div className="stat">
            <span>Poin</span>
            <b className="accent">+{formatNumber(outcome.points)}</b>
          </div>
          <div className="stat">
            <span>Total</span>
            <b>{formatNumber(totalScore)}</b>
          </div>
        </div>
        <div className="bar" aria-hidden>
          <i style={{ width: `${(outcome.points / MAX_POINTS) * 100}%` }} />
        </div>
        <p className="result-msg">{verdict(outcome)}</p>
        <button type="button" className="btn btn-primary btn-big" onClick={onNext} autoFocus>
          {last ? 'Lihat Hasil Akhir 🏁' : 'Lanjut ➜'}
        </button>
      </section>
    </main>
  );
}
