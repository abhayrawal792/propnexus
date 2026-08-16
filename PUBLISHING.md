# Publishing PropNexus

The full source code is available in the private GitHub repository: <https://github.com/abhayrawal792/propnexus>.

## Recommended publishing path

Use the project’s built-in publishing flow. It supports the full-stack runtime, Manus OAuth administration, managed image storage, and the Supabase-backed listing data already configured for PropNexus. After the final project checkpoint is available, open the project dashboard and select **Publish**. A custom domain can be configured later from the project settings.

## GitHub deployment note

The repository is ready for source control and future development. If it is deployed on an external host, that host must provide the environment variables used by the application, including the Supabase URL, Supabase server key, Supabase management token for maintenance scripts only, and the server-side Manus OAuth/database runtime variables. Because these runtime services are preconfigured in the managed project environment, external deployment may require additional compatibility work.

## Operational handoff

The `supabase/schema.sql` file records the live database schema, and `scripts/seed-supabase-properties.mjs` can safely upsert the initial curated portfolio if a new Supabase project is used later. Never expose server-only Supabase keys in browser code or commit local `.env` files.
