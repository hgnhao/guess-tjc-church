-- Jalankan sekali di Supabase → SQL Editor → New query → Run.
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  room text not null check (char_length(room) between 1 and 20),
  name text not null check (char_length(name) between 1 and 20),
  score int not null check (score between 0 and 100000),
  avg_km int not null check (avg_km between 0 and 25000),
  rounds int not null check (rounds between 1 and 20),
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

create policy "anyone can read scores" on public.scores
  for select using (true);

create policy "anyone can insert scores" on public.scores
  for insert with check (true);

create index scores_room_idx on public.scores (room, score desc);

-- Tambahan (aman dijalankan): pastikan role publik boleh baca & tulis lewat API,
-- untuk project yang tidak otomatis memberi akses ke tabel baru.
grant select, insert on public.scores to anon, authenticated;
