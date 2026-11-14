import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_ROOM, evaluateGuess, ROUNDS, roundsForRoom, seedForRoom, type Location, type RoundOutcome, type Sessions } from './lib/game';
import type { LatLng } from './lib/geo';
import { parseHash, useHash } from './lib/hooks';
import { loadLocations } from './lib/locations';
import { loadJSON, removeKey, saveJSON } from './lib/storage';
import Board from './screens/Board';
import Final from './screens/Final';
import Round from './screens/Round';
import RoundResult from './screens/RoundResult';
import Start from './screens/Start';

const PREFS_KEY = 'tjc-prefs';
const GAME_KEY = 'tjc-game';

interface Prefs {
  name: string;
  room: string;
}

type Phase = 'round' | 'result' | 'final';

interface GameState {
  v: 1;
  room: string;
  name: string;
  seed: number;
  roundIds: string[];
  index: number;
  outcomes: RoundOutcome[];
  phase: Phase;
  /** Deadline ronde yang sedang berjalan (ms epoch), supaya refresh tidak mereset timer. */
  deadline: number | null;
}

export default function App() {
  const { path, params } = parseHash(useHash());
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [sessions, setSessions] = useState<Sessions>({});
  const [loadError, setLoadError] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(() => loadJSON<Prefs>(PREFS_KEY) ?? { name: '', room: DEFAULT_ROOM });
  const [game, setGame] = useState<GameState | null>(() => {
    const g = loadJSON<GameState>(GAME_KEY);
    return g && g.v === 1 && Array.isArray(g.roundIds) ? g : null;
  });

  useEffect(() => {
    let alive = true;
    loadLocations().then(({ locations, sessions }) => {
      if (!alive) return;
      setSessions(sessions);
      if (locations.length) setLocations(locations);
      else setLoadError(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const byId = useMemo(() => new Map((locations ?? []).map((l) => [l.id, l])), [locations]);
  const totalCountries = useMemo(() => new Set((locations ?? []).map((l) => l.country)).size, [locations]);

  // Game tersimpan tidak cocok lagi dengan data lokasi (file diganti) → buang
  const rounds = useMemo(() => {
    if (!game || !locations) return null;
    const rs = game.roundIds.map((id) => byId.get(id));
    return rs.every(Boolean) ? (rs as Location[]) : null;
  }, [game, locations, byId]);

  useEffect(() => {
    if (game && locations && !rounds) setGame(null);
  }, [game, locations, rounds]);

  useEffect(() => {
    if (game) saveJSON(GAME_KEY, game);
    else removeKey(GAME_KEY);
  }, [game]);

  const startGame = useCallback(
    (name: string, room: string) => {
      if (!locations) return;
      const p = { name, room };
      setPrefs(p);
      saveJSON(PREFS_KEY, p);
      const picked = roundsForRoom(locations, room, sessions, ROUNDS);
      setGame({
        v: 1,
        room,
        name,
        seed: seedForRoom(room),
        roundIds: picked.map((l) => l.id),
        index: 0,
        outcomes: [],
        phase: 'round',
        deadline: null,
      });
      window.scrollTo(0, 0);
    },
    [locations, sessions],
  );

  const onTimerStart = useCallback((deadline: number) => {
    setGame((g) => (g && g.phase === 'round' ? { ...g, deadline } : g));
  }, []);

  const onSubmit = useCallback(
    (guess: LatLng | null) => {
      setGame((g) => {
        if (!g || g.phase !== 'round' || !rounds) return g;
        const loc = rounds[g.index];
        const outcomes = [...g.outcomes.slice(0, g.index), evaluateGuess(loc, guess)];
        return { ...g, outcomes, phase: 'result', deadline: null };
      });
    },
    [rounds],
  );

  const onNext = useCallback(() => {
    setGame((g) => {
      if (!g) return g;
      const next = g.index + 1;
      if (next >= g.roundIds.length) return { ...g, phase: 'final' };
      return { ...g, index: next, phase: 'round', deadline: null };
    });
  }, []);

  if (path.startsWith('/board')) {
    return <Board room={params.get('room') ?? prefs.room ?? DEFAULT_ROOM} />;
  }

  if (!game || !rounds) {
    return (
      <Start
        defaultName={prefs.name}
        defaultRoom={prefs.room}
        rounds={locations ? Math.min(ROUNDS, totalCountries) : ROUNDS}
        roundsFor={(room) => (locations ? roundsForRoom(locations, room, sessions, ROUNDS).length : ROUNDS)}
        status={loadError ? 'error' : locations ? 'ready' : 'loading'}
        onStart={startGame}
      />
    );
  }

  const totalScore = game.outcomes.reduce((s, o) => s + o.points, 0);
  const loc = rounds[game.index];

  if (game.phase === 'round') {
    return (
      <Round
        key={`${game.seed}-${game.index}`}
        location={loc}
        roundNo={game.index + 1}
        totalRounds={rounds.length}
        totalScore={totalScore}
        deadline={game.deadline}
        onTimerStart={onTimerStart}
        onSubmit={onSubmit}
      />
    );
  }

  if (game.phase === 'result') {
    return (
      <RoundResult
        key={`r-${game.index}`}
        location={loc}
        outcome={game.outcomes[game.index]}
        roundNo={game.index + 1}
        totalRounds={rounds.length}
        totalScore={totalScore}
        onNext={onNext}
      />
    );
  }

  return (
    <Final
      room={game.room}
      name={game.name}
      seed={game.seed}
      rounds={rounds}
      outcomes={game.outcomes}
      onPlayAgain={() => startGame(game.name, game.room)}
      onHome={() => setGame(null)}
    />
  );
}
