-- =============================================================
-- Personal Hub · Pruebas de seguridad (no es una migración)
-- Ejecuta cada bloque POR SEPARADO en el SQL Editor de Supabase.
-- Ninguno cambia datos: los bloques 2 y 3 acaban en rollback.
-- =============================================================

-- -------------------------------------------------------------
-- Bloque 1 · Resumen de todas las tablas
-- Esperado en cada fila: rls = true, politicas >= 4,
-- anon_lee = false y anon_escribe = false.
-- -------------------------------------------------------------
select
  c.relname as tabla,
  c.relrowsecurity as rls,
  (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as politicas,
  has_table_privilege('anon', c.oid, 'select') as anon_lee,
  has_table_privilege('anon', c.oid, 'insert,update,delete') as anon_escribe
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;

-- -------------------------------------------------------------
-- Bloque 2 · Un visitante sin sesión (rol anon) no puede leer
-- Esperado: ERROR "permission denied for table tasks".
-- Ese error es el resultado CORRECTO.
-- -------------------------------------------------------------
begin;
set local role anon;
select count(*) from public.tasks;
rollback;

-- -------------------------------------------------------------
-- Bloque 3 · Otro usuario con sesión no ve ni toca tus datos
-- Simula a un usuario inventado. Esperado: todo 0.
-- -------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

with editadas as (update public.tasks set title = title returning 1)
select
  (select count(*) from public.tasks)            as tareas,
  (select count(*) from public.notes)            as notas,
  (select count(*) from public.transactions)     as movimientos,
  (select count(*) from public.books)            as libros,
  (select count(*) from public.activities)       as actividades,
  (select count(*) from public.subjects)         as asignaturas,
  (select count(*) from public.job_applications) as candidaturas,
  (select count(*) from public.daily_goals)      as objetivos,
  (select count(*) from editadas)                as tareas_modificadas;
rollback;
