-- =============================================================
-- Personal Hub · Migración 0001: tabla de tareas
-- Ejecutar en Supabase -> SQL Editor (una sola vez).
-- =============================================================

-- 1. Tabla
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  -- Dueño de la tarea. Por defecto, el usuario que hace la petición.
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  description  text check (char_length(description) <= 2000),
  due_date     date not null,
  due_time     time,
  category     text not null default 'General' check (char_length(category) between 1 and 50),
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status       text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2. Índice: casi todas las consultas son "mis tareas entre dos fechas"
create index tasks_user_due_date_idx on public.tasks (user_id, due_date);

-- 3. Row Level Security: cada usuario solo ve y modifica SUS filas.
--    Sin estas políticas, la clave pública permitiría leer la tabla entera.
alter table public.tasks enable row level security;

create policy "Ver mis tareas" on public.tasks
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Crear mis tareas" on public.tasks
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Editar mis tareas" on public.tasks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Borrar mis tareas" on public.tasks
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 4. updated_at automático en cada modificación
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
