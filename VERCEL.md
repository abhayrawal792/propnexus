# Vercel deployment notes

The public repository is available at https://github.com/abhayrawal792/propnexus and the `main` branch contains both the React frontend and Express/tRPC backend.

## Current deployment contract

The project is built and hosted by the Manus full-stack runtime using `pnpm build`, which creates the browser bundle in `dist/public` and the Node server bundle in `dist/index.js`. The backend relies on the existing server runtime and Supabase-backed REST procedures; it is not a static-only Vite site.

Before deploying on Vercel, configure a Vercel-compatible Node function or equivalent Express adapter for `server/_core/index.ts`, and provide every project environment variable from the Manus Secrets panel, especially the Supabase URL and publishable/service-role keys plus the server authentication and built-in API values. Do not commit `.env` files or secrets.

If Vercel imports this repository as a Vite static project only, the frontend may render but tRPC, authenticated sync, inquiries, admin operations, and AI drafting will not be available. The complete full-stack deployment should therefore use a Vercel Node runtime adapter or the project’s supported Manus hosting runtime.
