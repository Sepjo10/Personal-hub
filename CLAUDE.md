# Personal Hub — Project Instructions

## 1. Project Overview

Personal Hub is a private, personal productivity and organization web application.

Its purpose is to centralize the user's daily planning, academic responsibilities, professional development, finances, reading progress, personal activities and notes in one place.

The application must be accessible from both a Windows laptop and an Android smartphone, sharing the same data across devices.

The project should prioritize:
- Simplicity and usability.
- A polished, modern interface.
- Responsive design.
- Reliable data persistence.
- Privacy and security.
- Maintainable and well-organized code.

This is a personal application for a single user. Do not introduce unnecessary multi-user or enterprise functionality.

## 2. Development Principles

Follow these rules throughout development:

1. Read this file before starting any development task.
2. Follow the defined project scope and development phases.
3. Do not implement future phases without explicit authorization.
4. Do not rewrite working code without a concrete reason.
5. Avoid unnecessary dependencies and excessive abstractions.
6. Prefer simple, readable and maintainable implementations.
7. Reuse components and avoid duplicated logic.
8. Explain important technical decisions briefly.
9. Do not silently remove existing functionality.
10. Do not overwrite existing files without inspecting them first.
11. Do not expose credentials, secrets or private information.
12. Do not invent completed functionality. Clearly identify anything that is still a placeholder.

When a task is ambiguous, ask before making architectural decisions that could affect the project significantly.

## 3. Technology Stack

Use the following technologies:

- Next.js with App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui for reusable interface components where appropriate.
- Supabase for PostgreSQL database and authentication.
- Google Calendar API for calendar integration.
- Vercel for deployment.
- Git for version control.

Use stable compatible versions and avoid adding libraries unless they provide a clear benefit.

Do not introduce a separate backend framework unless a concrete requirement justifies it.

## 4. Visual Design

### General appearance

The application must have a modern, minimalist and polished dark interface.

Visual guidelines:

- Dark background, avoiding pure black as the dominant color.
- Purple/violet accent colors.
- Subtle transparency and restrained glassmorphism.
- Discreet borders.
- Rounded corners.
- Clear typography and visual hierarchy.
- Consistent spacing.
- Subtle transitions and hover effects.
- Avoid excessive decoration and unnecessary cards.

The design should feel like a professional personal productivity dashboard.

### Responsive behavior

The interface must work correctly on:

- Desktop and laptop screens.
- Tablets.
- Android smartphones.

On desktop, use a left sidebar for navigation.

On mobile, adapt the navigation to a compact and practical layout. Do not simply shrink the desktop interface.

### Design consistency

Use reusable components and shared design tokens.

Buttons, forms, cards, dialogs, badges and navigation elements must follow a consistent visual language.

Avoid implementing different styles for the same type of component in different modules.

## 5. Main Navigation

To avoid an overcrowded interface, the 10 functional areas are grouped into 6 main sections. No functionality is removed; related views are grouped as tabs inside a section.

1. Home — main dashboard.
2. Planner — tabs: Today, Week, Month (sections 6.2–6.4).
3. Academic — tabs: University, Career (section 6.5).
4. Finances (section 6.6).
5. Leisure — tabs: Reading, Activities (sections 6.7–6.8).
6. Notes (section 6.9).

Settings (section 6.10) is not a main section: it is placed at the bottom of the sidebar, next to the account information.

On mobile, use a compact bottom navigation (for example: Home, Planner, quick-add button, Academic, More) where "More" gives access to the remaining sections.

Include a quick action to create a task from any main section.

The Home section should act as the main dashboard and must show only essential information.

## 6. Functional Requirements

### 6.1 Home

Display a concise overview of the user's current situation.

Include:

- Current date.
- Daily task summary.
- Three main daily priorities.
- Chronological agenda.
- Upcoming events.
- Daily objectives summary.
- Quick task creation.

Avoid overcrowding the dashboard.

### 6.2 Today

This section contains the detailed daily planner.

Tasks must support:

- Title.
- Optional description.
- Due date.
- Optional time.
- Category.
- Priority: low, medium or high.
- Status: pending or completed.

Users must be able to:

- Create tasks.
- Edit tasks.
- Delete tasks.
- Mark tasks as completed.
- View pending and completed tasks.

The daily agenda must display scheduled events chronologically.

Tasks and calendar events must remain distinguishable.

Support planning for the following day and displaying upcoming responsibilities.

Do not introduce complex task dependencies, project management systems or unnecessary subtasks in the initial version.

### 6.3 Week

Provide a weekly overview showing:

- Days of the week.
- Scheduled events.
- Tasks.
- Relevant deadlines.

Allow navigation between weeks.

### 6.4 Month

Provide a monthly calendar showing:

- Events.
- Tasks and deadlines.
- Relevant academic dates.

Allow navigation between months.

Tasks and events must be shared across Today, Week and Month. Do not duplicate records for different calendar views.

### 6.5 Academic

Divide this section into two main areas.

**University**

Support:

- Subjects.
- Class schedules.
- Exams.
- Assignments and practice deadlines.
- Simple progress tracking per subject.

**Professional development**

Support tracking internship and job applications.

Each application should be able to store:

- Company.
- Position or internship.
- Application date.
- Status.
- Interview dates.
- Notes.
- Next steps.

Suggested statuses:

- Pending.
- Applied.
- Interview.
- Accepted.
- Rejected.

### 6.6 Finances

Provide a simple manual personal finance tracker.

Support:

- Income records.
- Expense records.
- Categories.
- Dates.
- Amounts.
- Monthly income summary.
- Monthly expense summary.
- Monthly balance.
- Available spending overview.

Do not connect bank accounts or implement financial integrations.

### 6.7 Reading

Provide a personal reading tracker.

Each book may contain:

- Title.
- Author.
- Optional genre.
- Start date.
- Completion date.
- Current page.
- Total pages.
- Reading progress.
- Optional rating.
- Notes and reflections.

Possible statuses:

- To read.
- Currently reading.
- Finished.

Display reading progress clearly and provide a yearly reading summary.

### 6.8 Activities

Store personal activities and events such as:

- Flights and trips.
- Cinema.
- Concerts.
- Medical appointments.
- Personal events.

Optional information:

- Date and time.
- Location.
- Price.
- Links.
- Documents.
- People involved.
- Notes.

Keep optional fields optional.

### 6.9 Notes

Provide a simple space for:

- Quick notes.
- Important information.
- Useful resources.
- Links.
- Personal annotations.

Do not mix notes with the task management system.

### 6.10 Settings

Include:

- User preferences.
- Appearance settings.
- Notification preferences.
- Google Calendar connection.
- Account information.
- Sign out.

## 7. Database and Data Persistence

Use Supabase as the main persistent data store.

The application must share data between devices.

Do not rely on browser local storage as the primary database.

Use a clear and maintainable data model.

Plan separate entities for relevant concepts such as:

- Tasks.
- Calendar events.
- Subjects.
- Academic deadlines.
- Job applications.
- Financial transactions.
- Books.
- Activities.
- Notes.

Use appropriate relationships, timestamps and identifiers.

Avoid unnecessary duplication.

Temporary mock data may be used during the initial interface development, but it must be clearly separated from real application data.

## 8. Authentication and Security

The application is private and intended for one user.

Use Supabase authentication.

Implement Row Level Security (RLS) policies so that user data cannot be accessed by unauthorized users.

Security requirements:

- Never hardcode secrets.
- Never expose service-role keys in client-side code.
- Store credentials in environment variables.
- Keep OAuth credentials secure.
- Protect private application routes.
- Validate user input.
- Apply least-privilege access.

Create an `.env.example` file containing variable names and placeholder values only. Never include real credentials in it.

## 9. Google Calendar Integration

Google Calendar is the priority external integration.

Implement it progressively:

1. Secure Google OAuth connection.
2. Retrieve calendar events.
3. Display imported events in Today, Week and Month.
4. Distinguish imported events from internally created tasks.
5. Consider creating and editing Google Calendar events from Personal Hub in a later phase.

Do not implement complex bidirectional synchronization in the initial integration.

Handle authentication, permissions, token storage and errors securely.

Do not assume that Google Calendar is connected until the integration has actually been configured and tested.

## 10. PWA and Notifications

The application should eventually support installation as a Progressive Web App.

Requirements:

- Web app manifest.
- Suitable application icons.
- Mobile-friendly experience.
- Installability on supported browsers.
- Appropriate metadata.

Notifications may be implemented using browser notification capabilities where supported.

Respect browser permissions and platform limitations.

Do not promise guaranteed background notifications or alarms when the operating system may suspend browser execution.

## 11. Project Organization

Keep a clear separation between:

- Application routes.
- Layout components.
- Reusable UI components.
- Feature-specific components.
- Data access.
- Shared types.
- Utilities and hooks.

Prefer feature-oriented organization when it improves maintainability.

Do not create large files containing unrelated functionality.

Use descriptive names and consistent conventions.

## 12. Development Phases

Development must follow these phases.

### Phase 1 — Initial setup

- Create the Next.js project.
- Configure TypeScript and Tailwind CSS.
- Configure the basic project structure.
- Set up Git.
- Verify that the development server runs.

### Phase 2 — Visual interface

- Create the application layout.
- Implement sidebar navigation.
- Implement responsive navigation.
- Establish the design system.
- Create the Home dashboard.
- Add the main section layouts.

At this stage, mock data is acceptable.

### Phase 3 — Productivity functionality

> Decision (Nov 2026): the Supabase basics (project, auth, `tasks` table with RLS) were brought forward into this phase so tasks are persistent and synced from the start. Phase 5 extends Supabase to the remaining modules.

- Implement task creation and editing.
- Implement task completion.
- Implement daily agenda.
- Implement priorities.
- Implement Week and Month views.
- Ensure shared data between calendar views.

### Phase 4 — Personal modules

Implement:

- Academic.
- Professional applications.
- Finances.
- Reading.
- Activities.
- Notes.

### Phase 5 — Backend and authentication

> Supabase, authentication and the `tasks` table already exist (done in Phase 3). Database changes live in `supabase/migrations/`.

- Configure Supabase.
- Design and create database tables.
- Implement authentication.
- Implement RLS.
- Connect the application to persistent data.
- Test data access and security.

### Phase 6 — Google Calendar

- Configure OAuth.
- Connect Google Calendar.
- Retrieve events.
- Display imported events.
- Test permissions and error handling.

### Phase 7 — PWA and notifications

- Configure the manifest.
- Add application icons.
- Test mobile installation.
- Implement supported notification functionality.
- Test on Android.

### Phase 8 — Deployment and final testing

- Configure Vercel.
- Configure production environment variables.
- Deploy the application.
- Verify authentication and access protection.
- Test desktop and mobile layouts.
- Test data persistence.
- Review security and errors.

Do not skip phases or implement later phases without authorization.

## 13. Git and Version Control

Use Git throughout development.

Create logical commits after stable milestones.

Do not commit:

- `.env` files containing credentials.
- Private tokens.
- Secrets.
- Local dependencies such as `node_modules`.

Maintain a suitable `.gitignore`.

Do not force-push or delete existing Git history.

## 14. Working Procedure

For each authorized task:

1. Read the relevant project instructions.
2. Inspect the existing implementation.
3. Identify the files that need modification.
4. Make only the changes required.
5. Run relevant checks.
6. Fix errors introduced by the changes.
7. Summarize the work completed.
8. Explain how to test it.
9. Identify any remaining limitations.

Do not continue to the next development phase without authorization.

When something fails, investigate the actual cause instead of applying unrelated changes.

Prefer small, verifiable changes over large rewrites.

## 15. Current Development Scope

The project starts from zero.

The first authorized task is Phase 1 only.

Do not implement the dashboard, functional modules, database, authentication, Google Calendar, PWA or deployment during initial setup.

First establish a clean, working Next.js foundation.

Wait for explicit authorization before beginning Phase 2.