import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { sendComparisonPdfEmail } from "../_core/comparisonEmail";

const comparisonProperty = z.object({
  title: z.string().min(1).max(160),
  location: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  price: z.string().min(1).max(80),
  propertyType: z.string().min(1).max(60),
  areaSize: z.string().min(1).max(80),
  bedrooms: z.number().int().min(0).max(100),
  status: z.string().min(1).max(40),
});

export const comparisonRouter = router({
  emailPdf: publicProcedure.input(z.object({ recipient: z.string().email(), personalMessage: z.string().trim().max(1000).optional(), properties: z.array(comparisonProperty).min(1).max(3) })).mutation(async ({ input }) => {
    try {
      const sent = await sendComparisonPdfEmail(input.recipient, input.properties, input.personalMessage);
      if (!sent) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Comparison email is not configured yet. Add the optional SMTP settings to enable PDF delivery." });
      return { success: true } as const;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.warn("[Comparison] PDF email unavailable", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The comparison PDF could not be emailed. Please try again." });
    }
  }),
});
