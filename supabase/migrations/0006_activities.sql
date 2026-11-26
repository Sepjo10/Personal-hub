-- =============================================================
-- Personal Hub · Migración 0006: actividades
-- =============================================================

create table public.activities (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 150),
  type       text not null default 'event' check (type in ('flight', 'trip', 'cinema', 'concert', 'medical', 'event')),
  date       date,
  time       time,
  location   text check (char_length(location) <= 200),
  price      numeric(10, 2) check (price >= 0),
  -- Arrays de texto: varios enlaces (entradas, reservas, documentos en Drive...) y personas
  links      text[] not null default '{}',
  people     text[] not null default '{}',
  notes      text check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activities_user_date_idx on public.activities (user_id, date);

grant select, insert, update, delete on table public.activities to authenticated;
alter table public.activities enable row level security;

create policy "Ver mis actividades" on public.activities for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis actividades" on public.activities for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mis actividades" on public.activities for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis actividades" on public.activities for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();
