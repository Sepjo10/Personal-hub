-- =============================================================
-- Personal Hub · Migración 0011: notificaciones push (resumen diario)
-- 1. push_subscriptions: los dispositivos donde activaste las notificaciones.
-- 2. private.cron_secret: huella (SHA-256) del secreto del cron. El esquema
--    "private" no está expuesto en la API: nadie puede leerlo desde fuera.
-- 3. daily_digest(): el cron de Vercel no tiene sesión, así que en lugar de
--    usar la "secret key" de Supabase llama a esta función, que solo responde
--    si recibe el secreto correcto. Así nunca necesitamos la service_role key.
-- =============================================================

create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint   text not null unique check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  p256dh     text not null check (char_length(p256dh) <= 200),
  auth       text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on table public.push_subscriptions to authenticated;
alter table public.push_subscriptions enable row level security;

create policy "Ver mis dispositivos" on public.push_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Crear mis dispositivos" on public.push_subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Editar mis dispositivos" on public.push_subscriptions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Borrar mis dispositivos" on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Secreto del cron (solo su huella), en un esquema privado
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.cron_secret (
  id          smallint primary key default 1 check (id = 1),
  secret_hash bytea not null
);
-- Capa extra: RLS sin políticas = nadie puede leerla por la API. La función
-- daily_digest() sí puede porque se ejecuta como el propietario (security definer).
alter table private.cron_secret enable row level security;

-- Resumen del día de cada dispositivo suscrito
create or replace function public.daily_digest(p_secret text, p_date date)
returns table (
  endpoint text, p256dh text, auth text,
  tasks_pending int, task_titles text[], classes int, academic text[], activities text[]
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if p_secret is null or not exists (
    select 1 from private.cron_secret c where c.secret_hash = extensions.digest(p_secret, 'sha256')
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
  select
    s.endpoint, s.p256dh, s.auth,
    (select count(*)::int from public.tasks t
      where t.user_id = s.user_id and t.due_date = p_date and t.status = 'pending'),
    array(select t.title from public.tasks t
      where t.user_id = s.user_id and t.due_date = p_date and t.status = 'pending'
      order by case t.priority when 'high' then 0 when 'medium' then 1 else 2 end, t.due_time nulls last
      limit 3),
    (select count(*)::int from public.class_sessions cs
      join public.subjects sj on sj.id = cs.subject_id
      where cs.user_id = s.user_id and sj.active
        and cs.weekday = extract(isodow from p_date)::int - 1
        and (sj.period_start is null or p_date >= sj.period_start)
        and (sj.period_end is null or p_date <= sj.period_end)),
    array(select (case d.kind when 'exam' then 'Examen: ' else 'Entrega: ' end) || d.title
      from public.academic_dates d
      where d.user_id = s.user_id and d.date = p_date and not d.done),
    array(select a.title from public.activities a
      where a.user_id = s.user_id and a.date = p_date)
  from public.push_subscriptions s;
end;
$$;

-- Borra un dispositivo cuya suscripción ya no existe (el navegador la retiró)
create or replace function public.remove_push_subscription(p_secret text, p_endpoint text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_secret is null or not exists (
    select 1 from private.cron_secret c where c.secret_hash = extensions.digest(p_secret, 'sha256')
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  delete from public.push_subscriptions where endpoint = p_endpoint;
end;
$$;

revoke execute on function public.daily_digest(text, date) from public;
revoke execute on function public.remove_push_subscription(text, text) from public;
grant execute on function public.daily_digest(text, date) to anon;
grant execute on function public.remove_push_subscription(text, text) to anon;
