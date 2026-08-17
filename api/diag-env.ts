export const config = { runtime: "nodejs22.x" };

export default function handler(_req: any, res: any) {
  res.status(200).json({
    supabaseUrl: Boolean(process.env.VITE_SUPABASE_URL),
    supabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    forgeUrl: Boolean(process.env.BUILT_IN_FORGE_API_URL),
    forgeKey: Boolean(process.env.BUILT_IN_FORGE_API_KEY),
  });
}
