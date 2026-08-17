export const config = { runtime: "nodejs22.x" };

export default async function handler(_req: any, res: any) {
  const steps: string[] = [];
  try {
    steps.push("start");
    await import("../server/_core/context");
    steps.push("context");
    await import("../server/routers");
    steps.push("routers");
    res.status(200).json({ ok: true, steps });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined;
    res.status(200).json({ ok: false, steps, message, stack });
  }
}
