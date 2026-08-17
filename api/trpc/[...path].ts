import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

export const config = { runtime: "nodejs22.x" };

function toExpressLikeRequest(request: Request) {
  const url = new URL(request.url);
  return {
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    method: request.method,
    url: `${url.pathname}${url.search}`,
    originalUrl: `${url.pathname}${url.search}`,
  } as any;
}

export default async function handler(req: any, res: any) {
  const protocol = req.headers?.host?.includes("localhost") ? "http" : "https";
  const url = new URL(req.url || "/api/trpc", `${protocol}://${req.headers?.host || "localhost"}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (typeof value === "string") headers.set(key, value);
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body),
  });

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext({
      req: toExpressLikeRequest(request),
      res: res as any,
    }),
  });

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
