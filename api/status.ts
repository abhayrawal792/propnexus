export const config = { runtime: "nodejs22.x" };

export default function handler(_req: any, res: any) {
  res.status(200).json({ ok: true, status: "online" });
}
