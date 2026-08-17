# PropNexus deployment: Supabase and Vercel

The public repository is [github.com/abhayrawal792/propnexus](https://github.com/abhayrawal792/propnexus). The `main` branch contains the React frontend, tRPC API, Supabase REST integration, and Vercel catch-all function.

## Important database distinction

PropNexus currently uses two database paths:

| Area | Current connection | Required setup |
|---|---|---|
| Public properties and inquiries | Supabase REST API | Supabase tables must exist and `VITE_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` must be configured. |
| Manus-authenticated user records and saved-search sync | Drizzle with `drizzle-orm/mysql2` | `DATABASE_URL` must be a compatible MySQL/TiDB connection string. A normal Supabase PostgreSQL connection string cannot be used by the current Drizzle client. |

Do **not** paste a Supabase PostgreSQL URL into `DATABASE_URL` unless the database client and schema are first migrated from MySQL to PostgreSQL. The current `drizzle/schema.ts`, `drizzle.config.ts`, and `server/db.ts` explicitly use the MySQL dialect and `mysql2` driver.

## Supabase setup

Open the Supabase project dashboard and select **SQL Editor → New query**. The current server code expects a `properties` table and an `inquiries` table. If these tables have not already been created, apply the following SQL. Run it once, then confirm the tables appear under **Table Editor**.

```sql
create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric not null default 0,
  listing_type text not null check (listing_type in ('Sale', 'Rent')),
  property_type text not null check (property_type in ('House', 'Apartment', 'Land', 'Commercial')),
  status text not null default 'Available' check (status in ('Available', 'Under Offer', 'Sold', 'Rented')),
  location text not null,
  city text not null,
  area_size text not null,
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  floors integer not null default 0,
  parking_spaces integer not null default 0,
  road_access text not null default '',
  facing_direction text not null default '',
  amenities jsonb not null default '[]'::jsonb,
  image_urls jsonb not null default '[]'::jsonb,
  featured_image text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  ward integer not null default 0,
  municipality text not null default '',
  road_width integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_published_created_idx
  on public.properties (is_published, created_at desc);

create index if not exists properties_city_idx
  on public.properties (city);

create index if not exists inquiries_created_idx
  on public.inquiries (created_at desc);

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;

-- Public browser reads are optional because the application reads through its server API.
-- The service-role key is used only on the server and bypasses RLS.
create policy if not exists "public can read published properties"
  on public.properties for select
  using (is_published = true);
```

The application’s server code uses the service-role key for Supabase REST requests. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never prefix it with `VITE_` and never place it in browser code.

## Current Drizzle migration

The repository’s Drizzle configuration is MySQL-specific. It has no PostgreSQL-compatible Supabase migration to run directly. The existing package script, `pnpm db:push`, invokes `drizzle-kit generate && drizzle-kit migrate` against `DATABASE_URL`, so it should only be run after `DATABASE_URL` points to the project’s compatible MySQL/TiDB database.

To run the current Drizzle migration locally:

```bash
cd propnexus
pnpm install
export DATABASE_URL='mysql://USER:PASSWORD@HOST:3306/DATABASE'
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Never run those commands with a Supabase PostgreSQL connection string. If the intention is to move **all** user, saved-search, and AI-history tables into Supabase PostgreSQL, the code must first be converted to `drizzle-orm/postgres-js` or the Supabase client, the schema must be rewritten with PostgreSQL types, and a new PostgreSQL migration must be generated and reviewed. That is a code migration, not a Vercel environment-variable change.

## Vercel environment variables

In Vercel, open **Project → Settings → Environment Variables**. Add the exact keys and matching values from the Manus project Secrets panel. Select **Production**, **Preview**, and **Development** for each value.

| Key | Use |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL, without `/rest/v1` required by the code; the server also normalizes a REST URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase REST access. |
| `DATABASE_URL` | Compatible MySQL/TiDB URL for Drizzle-backed authenticated data. |
| `JWT_SECRET` | Session signing. |
| `VITE_APP_ID` | OAuth application ID. |
| `OAUTH_SERVER_URL` | OAuth server endpoint. |
| `VITE_OAUTH_PORTAL_URL` | Frontend login portal. |
| `OWNER_OPEN_ID` | Owner/admin identity. |
| `OWNER_NAME` | Owner display name. |
| `BUILT_IN_FORGE_API_URL` | Server built-in API endpoint. |
| `BUILT_IN_FORGE_API_KEY` | Server built-in API authentication. |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend built-in API endpoint. |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend built-in API authentication. |
| `VITE_APP_TITLE` | `PropNexus`. |
| `VITE_APP_LOGO` | PropNexus logo configuration. |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint, if enabled. |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics site identifier, if enabled. |

SMTP variables are optional. Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `OWNER_ALERT_EMAIL` only when a secondary email alert channel is configured.

## Vercel build settings

Use the repository’s included `vercel.json` and confirm the following values if Vercel displays them:

| Setting | Value |
|---|---|
| Framework | Vite |
| Build command | `pnpm build` |
| Output directory | `dist/public` |
| Install command | `pnpm install` |
| Root directory | `.` |

The API function is `api/[...path].ts`. It creates the Express application with `serveFrontend: false`, allowing Vercel to handle the frontend files separately. The local development listener is guarded so it does not start inside Vercel.

## Verification after deployment

After deploying, open the production URL and verify the homepage and catalogue first. Then test a property detail page and submit a test inquiry. The inquiry should either succeed or show the explicit “inquiry database is awaiting Supabase schema activation” message if the Supabase table is missing.

In Vercel, open **Deployments → Functions → Logs** and look for successful requests to `/api/trpc/properties.list` and `/api/trpc/inquiries.create`. A `PGRST205` or `42P01` error means the Supabase table or column is missing. A `503` configuration error means `VITE_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing from the selected Vercel environment. A Drizzle connection error means `DATABASE_URL` is missing or is not a compatible MySQL/TiDB URL.

If OAuth redirects to the wrong location, add the Vercel production URL and its OAuth callback path to the authentication provider’s allowed redirect URLs. After changing environment variables, redeploy because Vercel injects them at deployment/runtime boundaries.
