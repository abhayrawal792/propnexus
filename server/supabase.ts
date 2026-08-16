type RestErrorPayload = { message?: string; code?: string; hint?: string };

export class SupabaseRestError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "SupabaseRestError";
    this.status = status;
    this.code = code;
  }
}

function getBaseUrl() {
  return process.env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export function hasSupabaseServerAccess() {
  return Boolean(getBaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isSchemaUnavailable(error: unknown) {
  return (
    error instanceof SupabaseRestError &&
    (error.status === 404 || error.code === "PGRST205" || error.code === "42P01")
  );
}

export async function supabaseRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !key) {
    throw new SupabaseRestError(503, "Supabase server configuration is incomplete.");
  }

  const cleanPath = path.replace(/^\/+/, "");
  const response = await fetch(`${baseUrl}/rest/v1/${cleanPath}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as RestErrorPayload;
    throw new SupabaseRestError(
      response.status,
      body.message || `Supabase request failed (${response.status}).`,
      body.code,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
