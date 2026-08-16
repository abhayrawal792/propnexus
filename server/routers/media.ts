import { z } from "zod";
import { storagePut } from "../storage";
import { router } from "../_core/trpc";
import { adminProcedure } from "./_shared";

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "property-image";
}

export const mediaRouter = router({
  upload: adminProcedure.input(z.object({ fileName: z.string().min(1).max(120), contentType: z.string().regex(/^image\//), base64: z.string().min(20).max(8_000_000) })).mutation(async ({ input, ctx }) => {
    const binary = Buffer.from(input.base64, "base64");
    const { url } = await storagePut(`properties/${ctx.user.id}/${safeFileName(input.fileName)}`, binary, input.contentType);
    return { url };
  }),
});
