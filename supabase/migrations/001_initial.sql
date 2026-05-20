-- Cornhole Tracker: games, rounds, bag_throws with per-user RLS

create table public.games (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  mode text not null check (mode in ('singles', 'doubles', 'solo')),
  team_a_name text not null,
  team_b_name text not null,
  score_a integer not null default 0,
  score_b integer not null default 0,
  status text not null check (status in ('in_progress', 'completed')),
  current_round_index integer not null default 0,
  current_throw_index integer not null default 0,
  next_team_id text not null check (next_team_id in ('A', 'B')),
  first_throw_team_id text not null check (first_throw_team_id in ('A', 'B')),
  round_first_team_id text not null check (round_first_team_id in ('A', 'B')),
  player_a1_name text,
  player_a2_name text,
  player_b1_name text,
  player_b2_name text,
  first_throw_player_key text check (first_throw_player_key in ('A1', 'A2', 'B1', 'B2')),
  round_lead_player_key text check (round_lead_player_key in ('A1', 'A2', 'B1', 'B2')),
  avg_points_a double precision,
  avg_points_b double precision,
  completed_at timestamptz
);

create index games_user_id_idx on public.games (user_id);
create index games_user_updated_idx on public.games (user_id, updated_at desc);

create table public.rounds (
  id uuid primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  index integer not null,
  raw_points_a integer not null,
  raw_points_b integer not null,
  awarded_a integer not null,
  awarded_b integer not null,
  submitted_at timestamptz not null,
  unique (game_id, index)
);

create index rounds_game_id_idx on public.rounds (game_id);

create table public.bag_throws (
  id uuid primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  round_index integer not null,
  sequence integer not null,
  team_id text not null check (team_id in ('A', 'B')),
  x_norm double precision not null,
  y_norm double precision not null,
  rotation_deg double precision not null,
  raw_points integer not null,
  created_at timestamptz not null
);

create index bag_throws_game_id_idx on public.bag_throws (game_id);
create index bag_throws_game_round_idx on public.bag_throws (game_id, round_index);

alter table public.games enable row level security;
alter table public.rounds enable row level security;
alter table public.bag_throws enable row level security;

create policy "Users select own games"
  on public.games for select
  using (auth.uid() = user_id);

create policy "Users insert own games"
  on public.games for insert
  with check (auth.uid() = user_id);

create policy "Users update own games"
  on public.games for update
  using (auth.uid() = user_id);

create policy "Users delete own games"
  on public.games for delete
  using (auth.uid() = user_id);

create policy "Users select rounds for own games"
  on public.rounds for select
  using (
    exists (
      select 1 from public.games g
      where g.id = rounds.game_id and g.user_id = auth.uid()
    )
  );

create policy "Users insert rounds for own games"
  on public.rounds for insert
  with check (
    exists (
      select 1 from public.games g
      where g.id = rounds.game_id and g.user_id = auth.uid()
    )
  );

create policy "Users update rounds for own games"
  on public.rounds for update
  using (
    exists (
      select 1 from public.games g
      where g.id = rounds.game_id and g.user_id = auth.uid()
    )
  );

create policy "Users delete rounds for own games"
  on public.rounds for delete
  using (
    exists (
      select 1 from public.games g
      where g.id = rounds.game_id and g.user_id = auth.uid()
    )
  );

create policy "Users select bag_throws for own games"
  on public.bag_throws for select
  using (
    exists (
      select 1 from public.games g
      where g.id = bag_throws.game_id and g.user_id = auth.uid()
    )
  );

create policy "Users insert bag_throws for own games"
  on public.bag_throws for insert
  with check (
    exists (
      select 1 from public.games g
      where g.id = bag_throws.game_id and g.user_id = auth.uid()
    )
  );

create policy "Users update bag_throws for own games"
  on public.bag_throws for update
  using (
    exists (
      select 1 from public.games g
      where g.id = bag_throws.game_id and g.user_id = auth.uid()
    )
  );

create policy "Users delete bag_throws for own games"
  on public.bag_throws for delete
  using (
    exists (
      select 1 from public.games g
      where g.id = bag_throws.game_id and g.user_id = auth.uid()
    )
  );
