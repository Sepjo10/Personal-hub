# Personal Hub

Dashboard personal de productividad y organización: tareas, agenda, calendario académico, candidaturas, finanzas, lecturas, actividades y notas en un único lugar. Funciona en portátil y como app instalable en Android, con sincronización entre dispositivos.

## Funcionalidades

- **Planificador:** tareas con prioridad y categoría; vistas Hoy, Semana y Mes; objetivos diarios con progreso.
- **Académico:** asignaturas con horario semanal, exámenes y entregas; seguimiento de candidaturas con entrevistas.
- **Finanzas:** ingresos y gastos por categoría con gráficas propias en SVG.
- **Ocio:** biblioteca de lecturas con progreso y actividades (viajes, conciertos, citas...).
- **Notas:** rápidas, importantes, recursos y enlaces, con fijado.
- **Google Calendar:** importación de eventos de solo lectura, con elección de calendarios.
- **PWA y notificaciones:** instalable en Android y resumen diario por notificación push.

## Tecnologías

- [Next.js 16](https://nextjs.org/) (App Router, Cache Components, Server Actions) + React 19 + TypeScript
- Tailwind CSS 4 y shadcn/ui
- Supabase: PostgreSQL, autenticación y Row Level Security
- Google Calendar API (OAuth 2.0)
- Web Push (VAPID) y Vercel Cron
- Despliegue en Vercel

## Seguridad

- **RLS en todas las tablas:** cada usuario solo accede a sus filas; el rol anónimo no tiene permisos. Pruebas en `supabase/tests/security_checks.sql`.
- **Validación en el servidor:** todas las escrituras pasan por Server Actions que comprueban la sesión y validan los datos.
- **Google OAuth de solo lectura:** protección CSRF con `state`; el refresh token se guarda cifrado con AES-256-GCM.
- **Cron sin clave de servicio:** el resumen diario usa una función `security definer` protegida por la huella SHA-256 de un secreto.
- **Cabeceras HTTP de seguridad:** nota A+ en securityheaders.com.
- **Sin caché de datos privados** en el service worker.

## Estructura

```
src/
├── app/            # Rutas (App Router), API de Google y cron, manifest
├── components/     # Layout, componentes comunes y shadcn/ui
├── features/       # Cada módulo: datos (servidor), acciones y componentes
├── lib/            # Supabase, autenticación, fechas, Google y push
└── types/          # Tipos compartidos
supabase/
├── migrations/     # Esquema versionado (0001 a 0011)
└── tests/          # Pruebas de seguridad (RLS y permisos)
```

## Ejecutar en local

Requisitos: Node.js 22 o superior y un proyecto de Supabase.

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

Ejecuta las migraciones de `supabase/migrations/` en orden en el SQL Editor de Supabase y abre http://localhost:3000.
