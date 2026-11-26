-- =============================================================
-- Personal Hub · Migración 0009: objetivos diarios
-- daily_goals guarda la definición (Estudio, 4 h...).
-- goal_logs guarda cuánto llevas cada día: una fila por objetivo y fecha.
-- =============================================================

create table public.daily_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label      text not null check (char_length(label) between 1 and 40),
  target     numeric(8,2) not null check (target > 0),
  step       numeric(8,2) not null default 1 check (step > 0),
  unit       text not null default '' check (char_length(unit) <= 15),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index daily_goals_user_idx on public.daily_goals (user_id, created_at);

create table public.goal_logs (
  goal_id  uuid not null references public.daily_goals (id) on delete cascade,
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date date not null,
  value    numeric(8,2) not null default 0 check (value >= 0),
  primary key (goal_id, log_date)
);

create index goal_logs_user_date_idx on public.goal_logs (user_id, log_date);

-- Permisos: solo usuarios con sesión; RLS limita a sus propias filas
grant select, insert, update, delete on table public.daily_goals to authenticated;
grant select, insert, update, delete on table public.goal_logs to authenticated;
alter table public.daily_goals enable row level security;
alter table public.goal_logs enable row level security;

create policy "Ver mis objetivos" on public.daily_goals for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis objetivos" on public.daily_goals for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mis objetivos" on public.daily_goals for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis objetivos" on public.daily_goals for delete to authenticated
  using ((select auth.uid()) = user_id);

-- En los registros, además de ser míos, el objetivo también tiene que ser mío
create policy "Ver mis registros" on public.goal_logs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis registros" on public.goal_logs for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.daily_goals g where g.id = goal_id and g.user_id = (select auth.uid()))
  );
create policy "Editar mis registros" on public.goal_logs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.daily_goals g where g.id = goal_id and g.user_id = (select auth.uid()))
  );
create policy "Borrar mis registros" on public.goal_logs for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Reutiliza la función creada en 0001
create trigger daily_goals_set_updated_at
  before update on public.daily_goals
  for each row execute function public.set_updated_at();
