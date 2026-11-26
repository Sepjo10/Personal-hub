-- =============================================================
-- Personal Hub · Migración 0010: conexión con Google Calendar
-- Una fila por usuario. refresh_token va CIFRADO (AES-256-GCM) por el
-- servidor de Next con GOOGLE_TOKEN_KEY: aquí nunca está en claro.
-- =============================================================

create table public.google_connections (
  user_id       uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  google_email  text,
  refresh_token text not null,
  calendar_ids  text[] not null default '{}',
  status        text not null default 'ok' check (status in ('ok', 'error')),
  connected_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Permisos: solo usuarios con sesión; RLS limita a su propia fila
grant select, insert, update, delete on table public.google_connections to authenticated;
alter table public.google_connections enable row level security;

create policy "Ver mi conexión" on public.google_connections for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mi conexión" on public.google_connections for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mi conexión" on public.google_connections for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mi conexión" on public.google_connections for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger google_connections_set_updated_at
  before update on public.google_connections
  for each row execute function public.set_updated_at();
