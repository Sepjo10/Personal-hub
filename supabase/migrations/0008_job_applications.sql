-- =============================================================
-- Personal Hub · Migración 0008: candidaturas (carrera profesional)
-- =============================================================

create table public.job_applications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company    text not null check (char_length(company) between 1 and 120),
  position   text not null check (char_length(position) between 1 and 150),
  status     text not null default 'pending' check (status in ('pending', 'sent', 'interview', 'accepted', 'rejected')),
  applied_on date,
  url        text check (url is null or url ~* '^https?://'),
  -- Fechas de las entrevistas (array: una candidatura puede tener varias)
  interviews date[] not null default '{}',
  next_step  text check (char_length(next_step) <= 200),
  notes      text check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_applications_user_idx on public.job_applications (user_id, updated_at desc);

grant select, insert, update, delete on table public.job_applications to authenticated;
alter table public.job_applications enable row level security;

create policy "Ver mis candidaturas" on public.job_applications for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis candidaturas" on public.job_applications for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mis candidaturas" on public.job_applications for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis candidaturas" on public.job_applications for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger job_applications_set_updated_at
  before update on public.job_applications
  for each row execute function public.set_updated_at();
