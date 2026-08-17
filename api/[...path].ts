import { createApp } from "../server/_core/index";

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: any, res: any) {
  appPromise ??= createApp({ serveFrontend: false });
  const app = await appPromise;
  return (app as unknown as (request: any, response: any) => unknown)(req, res);
}
