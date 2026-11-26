# Personal Hub

Dashboard personal de productividad y organización: tareas, agenda, calendario académico, candidaturas, finanzas, lecturas, actividades y notas en un único lugar, accesible desde portátil y móvil.

> Proyecto en desarrollo. Actualmente en la **Fase 1: preparación del proyecto**.

## Tecnologías

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- Tailwind CSS y shadcn/ui
- Supabase (PostgreSQL, autenticación y Row Level Security)
- Google Calendar API
- PWA para instalación en Android
- Despliegue en Vercel

## Estructura

```
src/
├── app/                 # Rutas y layouts (App Router)
├── components/
│   ├── layout/          # Menú lateral, cabecera, navegación móvil
│   └── ui/              # Componentes reutilizables (shadcn/ui)
├── features/            # Lógica y componentes de cada módulo
├── lib/                 # Utilidades y clientes (p. ej. Supabase)
├── types/               # Tipos TypeScript compartidos
└── data/mock/           # Datos ficticios para el desarrollo visual
```

## Ejecutar en local

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Hoja de ruta

1. Preparación del proyecto
2. Interfaz y sistema visual
3. Tareas, agenda y vistas de calendario
4. Módulos personales
5. Supabase: base de datos y autenticación
6. Integración con Google Calendar
7. PWA y adaptación móvil
8. Despliegue en Vercel
