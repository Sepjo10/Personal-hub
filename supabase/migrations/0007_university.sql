-- =============================================================
-- Personal Hub · Migración 0007: universidad
-- Tres tablas relacionadas:
--   subjects (asignaturas) 1 ── N class_sessions (clases semanales)
--   subjects (asignaturas) 1 ── N academic_dates (exámenes y entregas)
-- =============================================================

create table public.subjects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 100),
  code         text check (char_length(code) <= 20),
  professor    text check (char_length(professor) <= 100),
  progress     smallint not null default 0 check (progress between 0 and 100),
  -- Periodo lectivo: las clases solo aparecen en el calendario dentro de él
  period_start date,
  period_end   date,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint subjects_period_order check (period_end is null or period_start is null or period_end >= period_start)
);

create table public.class_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Si se borra la asignatura, se borran sus clases
  subject_id uuid not null references public.subjects (id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6), -- 0 = lunes
  start_time time not null,
  end_time   time not null,
  room       text check (char_length(room) <= 50),
  created_at timestamptz not null default now(),
  constraint class_sessions_time_order check (end_time > start_time)
);

create table public.academic_dates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 150),
  kind       text not null default 'deadline' check (kind in ('exam', 'deadline')),
  date       date not null,
  time       time,
  done       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index class_sessions_user_idx on public.class_sessions (user_id);
create index class_sessions_subject_idx on public.class_sessions (subject_id);
create index academic_dates_user_date_idx on public.academic_dates (user_id, date);
create index academic_dates_subject_idx on public.academic_dates (subject_id);

-- Permisos + RLS (mismo patrón en las tres tablas)
grant select, insert, update, delete on table public.subjects, public.class_sessions, public.academic_dates to authenticated;

alter table public.subjects enable row level security;
alter table public.class_sessions enable row level security;
alter table public.academic_dates enable row level security;

create policy "Ver mis asignaturas" on public.subjects for select to authenticated using ((select auth.uid()) = user_id);
create policy "Crear mis asignaturas" on public.subjects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Editar mis asignaturas" on public.subjects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis asignaturas" on public.subjects for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Ver mis clases" on public.class_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Crear mis clases" on public.class_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Editar mis clases" on public.class_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis clases" on public.class_sessions for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Ver mis fechas" on public.academic_dates for select to authenticated using ((select auth.uid()) = user_id);
create policy "Crear mis fechas" on public.academic_dates for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Editar mis fechas" on public.academic_dates for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis fechas" on public.academic_dates for delete to authenticated using ((select auth.uid()) = user_id);

create trigger subjects_set_updated_at before update on public.subjects
  for each row execute function public.set_updated_at();
create trigger academic_dates_set_updated_at before update on public.academic_dates
  for each row execute function public.set_updated_at();
