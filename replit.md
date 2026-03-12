# Rent-A-Buddy™

A safety-first platform for non-romantic platonic companionship. Clients hire Buddies for activities like coffee chats, hiking, museum visits, and more.

## Architecture

- **Frontend**: React + Vite + TypeScript, wouter routing, TanStack Query, Shadcn UI components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session**: connect-pg-simple (database-backed sessions)
- **Styling**: Tailwind CSS with "Wholesome Connectivity" design (Safety Teal/Friendly Coral palette, Plus Jakarta Sans typography)

## Key Files

- `shared/schema.ts` - Database schema (users, profiles, bookings, reviews, messages, safety_reports, transactions, agents, agent_jobs, agent_runs, agent_memory)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - IStorage interface + DbStorage implementation with Drizzle ORM
- `server/agents.ts` - Platform agent engine (Operations, Safety, Engagement, Quality agents)
- `client/src/App.tsx` - Route definitions
- `client/src/hooks/useAuth.tsx` - Auth context provider
- `client/src/lib/api.ts` - API client

## Pages

- **Home** - Landing page with hero, how-it-works, safety emphasis
- **Buddies** - Discovery page with search, filters (city, activity, rate, rating), sort options, verification badges
- **BuddyDetail** - Profile view with booking form, reviews, price calculator, messaging
- **Dashboard** - Role-aware dashboard (Client/Buddy) with:
  - Booking management (accept/reject/cancel/complete)
  - Performance analytics (Buddy only): earnings, ratings, completion rate, activity log
  - Trust & Verification progress (Buddy only)
  - Safety Center with report filing and tracking
  - Settings with profile editing
- **BuddyOnboarding** - 4-step wizard for new buddies (photo/bio → rates/location → activities → safety agreements)
- **Messages** - Thread-based messaging with real-time refresh
- **Policies** - Code of conduct, zero tolerance, safety agreements, terms

## Database Tables

users, client_profiles, buddy_profiles, bookings, reviews, message_threads, messages, availability, safety_reports, transactions, session

## Technical Notes

- Standard `pg` client (TCP) instead of Neon serverless (resolves WebSocket issues in Replit)
- Sessions explicitly saved with `session.save()` callback before response
- `useAuth.tsx`: login/register must NOT call `refetch()` after setting user
- Cookie config: `secure: false`, `sameSite: 'lax'` for dev environment
- Express JSON limit: 10mb for base64 image uploads
- React: All `<Link>` components use `<span>` children, never `<a>`
- Missing DB columns added via SQL `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (db:push requires interactive confirmation)

## Admin

- Admin user auto-seeded on server startup if not present
- Credentials stored in env vars: ADMIN_EMAIL, ADMIN_PASSWORD
- Login at `/login`, admin is redirected to `/admin` panel
- Admin can: view platform stats, manage users (suspend/activate), verify buddies (ID/background/certification), view all bookings, manage safety reports (investigate/resolve)

## Agent System

- 4 platform agents seeded on startup: Operations, Safety, Engagement, Quality
- Database tables: `agents`, `agent_jobs`, `agent_runs`, `agent_memory`
- Agent engine: `server/agents.ts` — runs analysis against real platform data
- Admin Agents tab: run individual agents, run all, generate daily executive brief
- Each agent produces: action logs, output summaries, quality scores, execution timing
- Agent memory: stores latest reports/metrics for trend analysis across runs
- Agents: Platform Operations (KPIs/briefings), Safety & Governance (flags/escalations), User Engagement (churn/conversion), Quality & Review (ratings/fake detection)

## Deployment (Self-Hosted)

- Dockerfile: multi-stage build (deps → build → production image)
- docker-compose.yml: app + PostgreSQL, uploads volume
- .env.example: all required environment variables documented
- Static assets in `client/public/media/` (logo, hero, texture)
- Uploads served from `/uploads/` directory
- APP_URL env var replaces Replit domain references
- Replit plugins loaded conditionally (fallback when not on Replit)

## Features Implemented

- Dual-role auth (Client/Buddy) with registration and login
- Buddy onboarding flow (4-step wizard)
- Profile management with image upload
- Booking lifecycle (Request → Accept/Reject → Complete, with price calculation)
- Review & rating system (star ratings, comments, average display)
- Messaging system (thread-based, real-time refresh)
- Safety reporting (multi-category, severity indicators, status tracking)
- Trust & verification system (identity, background check, certification badges)
- Search & discovery with filters and sorting
- Performance analytics dashboard for buddies
