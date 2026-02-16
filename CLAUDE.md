# Nuclear Staffing Solutions

## Project Overview
Two-sided workforce marketplace connecting nuclear industry professionals (engineers, control room operators, health physicists) with companies seeking contract staffing. Employers pay to post job listings.

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database / Auth / Storage**: Supabase
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **Deployment**: Vercel
- **Package Manager**: npm

## Project Structure
```
src/
  app/           # Next.js App Router pages & layouts
  components/    # Reusable UI components
  lib/           # Utilities, Supabase client, Stripe helpers
  types/         # TypeScript type definitions
supabase/
  migrations/    # SQL migration files
```

## Key Conventions
- Use TypeScript strict mode
- Use Next.js App Router (not Pages Router)
- Server Components by default; add 'use client' only when needed
- Use Supabase client from `@/lib/supabase` (browser) and `@/lib/supabase-server` (server)
- Tailwind for all styling - no CSS modules or styled-components
- Environment variables prefixed with `NEXT_PUBLIC_` for client-side Supabase keys

## Database
- Supabase PostgreSQL with Row Level Security (RLS) enabled on all tables
- Key tables: profiles, companies, jobs, applications, certifications
- Always use parameterized queries - never interpolate user input into SQL

## User Roles
- `candidate` - Nuclear professionals looking for contract work
- `employer` - Companies posting contract positions
- `admin` - Platform administrators

## Nuclear Industry Domain
- Certifications: SRO, RO, NRC, ANSI, HP, RP
- Clearance levels: None, L, Q
- Plant types: PWR, BWR, AP1000, ABWR, EPR, SMR
- Contract types: Outage, Long-term, Permanent
- NRC Regions: I, II, III, IV

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
