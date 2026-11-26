-- =============================================================
-- Personal Hub · Migración 0005: lecturas
-- =============================================================

create table public.books (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  author       text not null default '' check (char_length(author) <= 120),
  genre        text check (char_length(genre) <= 60),
  status       text not null default 'pending' check (status in ('pending', 'reading', 'finished')),
  current_page integer not null default 0 check (current_page >= 0),
  total_pages  integer not null check (total_pages > 0),
  start_date   date,
  end_date     date,
  rating       smallint check (rating between 1 and 5),
  notes        text check (char_length(notes) <= 10000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Reglas de coherencia entre columnas
  constraint books_page_within_total check (current_page <= total_pages),
  constraint books_dates_order check (end_date is null or start_date is null or end_date >= start_date)
);

create index books_user_status_idx on public.books (user_id, status);

grant select, insert, update, delete on table public.books to authenticated;
alter table public.books enable row level security;

create policy "Ver mis libros" on public.books for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis libros" on public.books for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mis libros" on public.books for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis libros" on public.books for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();
