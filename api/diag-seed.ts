export const config = { runtime: "nodejs22.x" };

import { seedProperties } from "../server/propertySeed";

export default function handler(_req: any, res: any) {
  res.status(200).json({ ok: true, count: seedProperties.length });
}
