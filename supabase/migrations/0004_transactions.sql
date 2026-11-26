-- =============================================================
-- Personal Hub · Migración 0004: movimientos de finanzas
-- =============================================================

create table public.transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type       text not null check (type in ('income', 'expense')),
  concept    text not null check (char_length(concept) between 1 and 120),
  -- numeric(10,2): importe exacto con 2 decimales (nunca float para dinero)
  amount     numeric(10, 2) not null check (amount > 0),
  category   text not null default 'Otros' check (char_length(category) between 1 and 50),
  date       date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, date);

grant select, insert, update, delete on table public.transactions to authenticated;
alter table public.transactions enable row level security;

create policy "Ver mis movimientos" on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis movimientos" on public.transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mis movimientos" on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis movimientos" on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();
