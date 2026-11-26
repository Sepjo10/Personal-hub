-- =============================================================
-- Personal Hub · Migración 0002: permisos de la tabla de tareas
-- En los proyectos nuevos de Supabase, las tablas creadas por SQL no se
-- exponen automáticamente a la API. Damos permiso SOLO al rol "authenticated"
-- (usuarios con sesión iniciada); el rol "anon" (sin sesión) no recibe nada.
-- RLS sigue limitando cada usuario a sus propias filas.
-- =============================================================

grant select, insert, update, delete on table public.tasks to authenticated;
