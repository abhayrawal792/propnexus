import { readFile } from "node:fs/promises";

const configuredUrl = process.env.VITE_SUPABASE_URL;
const managementToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!configuredUrl || !managementToken) {
  throw new Error("Supabase URL or management token is unavailable.");
}

const baseUrl = configuredUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const projectRef = new URL(baseUrl).hostname.split(".")[0];
const query = await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8");

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${managementToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});

const responseText = await response.text();
if (!response.ok) {
  throw new Error(`Supabase schema application failed (${response.status}): ${responseText.slice(0, 600)}`);
}

console.log(`Supabase schema applied to project ${projectRef}.`);
