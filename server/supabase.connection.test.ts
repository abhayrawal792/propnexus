import { describe, expect, it } from "vitest";

const configuredSupabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const managementToken = process.env.SUPABASE_ACCESS_TOKEN;

describe("Supabase configuration", () => {
  it("accepts the server-only key for protected operations", async () => {
    const supabaseUrl = configuredSupabaseUrl?.replace(/\/rest\/v1\/?$/, "");

    expect(supabaseUrl).toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(serviceRoleKey).toBeTruthy();

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: serviceRoleKey as string,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    expect(response.status).toBeLessThan(400);
  });

  it("accepts the management token for the connected Supabase project", async () => {
    const supabaseUrl = configuredSupabaseUrl?.replace(/\/rest\/v1\/?$/, "");
    const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split(".")[0] : undefined;

    expect(projectRef).toBeTruthy();
    expect(managementToken).toBeTruthy();

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}`, {
      headers: { Authorization: `Bearer ${managementToken}` },
    });

    expect(response.status).toBeLessThan(400);
  });
});
