-- =============================================================
-- Personal Hub · Migración 0003: notas
-- =============================================================

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  content    text not null default '' check (char_length(content) <= 10000),
  kind       text not null default 'quick' check (kind in ('quick', 'important', 'resource', 'link')),
  url        text check (url is null or url ~* '^https?://'),
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_updated_idx on public.notes (user_id, updated_at desc);

-- Permisos: solo usuarios con sesión; RLS limita a sus propias filas
grant select, insert, update, delete on table public.notes to authenticated;
alter table public.notes enable row level security;

create policy "Ver mis notas" on public.notes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis notas" on public.notes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mis notas" on public.notes for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis notas" on public.notes for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Reutiliza la función creada en 0001
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();
