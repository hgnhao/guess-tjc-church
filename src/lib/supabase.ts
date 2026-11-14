import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** true kalau env Supabase diisi. Kalau false, game jalan penuh tanpa papan skor online. */
export const supabaseEnabled = Boolean(url && key);

let clientPromise: Promise<SupabaseClient | null> | null = null;

/** Library Supabase hanya di-load kalau env diisi (lazy import, bundle utama tetap kecil). */
function getClient(): Promise<SupabaseClient | null> {
  if (!supabaseEnabled) return Promise.resolve(null);
  clientPromise ??= import('@supabase/supabase-js')
    .then((m) => m.createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } }))
    .catch(() => {
      clientPromise = null;
      return null;
    });
  return clientPromise;
}

export interface ScoreRow {
  room: string;
  name: string;
  score: number;
  avg_km: number;
  rounds: number;
}

export interface BoardEntry extends ScoreRow {
  rank: number;
}

export async function submitScore(row: ScoreRow): Promise<boolean> {
  try {
    const client = await getClient();
    if (!client) return false;
    const { error } = await client.from('scores').insert(row);
    return !error;
  } catch {
    return false;
  }
}

/** Skor ruangan, satu baris per nama (skor terbaik), urut menurun. null = gagal/nonaktif. */
export async function fetchBoard(room: string): Promise<BoardEntry[] | null> {
  try {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client
      .from('scores')
      .select('room,name,score,avg_km,rounds,created_at')
      .eq('room', room)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1000);
    if (error || !data) return null;
    const best = new Map<string, ScoreRow>();
    for (const r of data as ScoreRow[]) {
      const k = r.name.trim().toLowerCase();
      if (!best.has(k)) best.set(k, r); // data sudah urut skor menurun → baris pertama = terbaik
    }
    return [...best.values()].map((r, i) => ({ ...r, rank: i + 1 }));
  } catch {
    return null;
  }
}
