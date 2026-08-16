import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";
import { sendOwnerInquiryEmail } from "../_core/email";
import { z } from "zod";
import { isSchemaUnavailable, supabaseRest } from "../supabase";
import { publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "./_shared";

const inquiryInput = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(5).max(1000),
});

export const inquiriesRouter = router({
  create: publicProcedure.input(inquiryInput).mutation(async ({ input }) => {
    try {
      await supabaseRest("inquiries", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          property_id: input.propertyId,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          message: input.message,
        }),
      });
      let ownerAlertSent = false;
      let emailAlertSent = false;
      const alertContent = `Property ID: ${input.propertyId}\nName: ${input.name}\nPhone: ${input.phone}\nEmail: ${input.email || "Not provided"}\nMessage: ${input.message}`;
      try {
        ownerAlertSent = await notifyOwner({
          title: `New PropNexus inquiry from ${input.name}`,
          content: alertContent,
        });
      } catch (notificationError) {
        console.warn("[Inquiry] Owner alert unavailable; inquiry was still saved", notificationError);
      }
      try {
        emailAlertSent = await sendOwnerInquiryEmail(input);
      } catch (emailError) {
        console.warn("[Inquiry] Secondary email alert unavailable; inquiry was still saved", emailError);
      }
      return { success: true, ownerAlertSent, emailAlertSent };
    } catch (error) {
      if (isSchemaUnavailable(error)) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The inquiry database is awaiting Supabase schema activation." });
      }
      throw error;
    }
  }),
  adminList: adminProcedure.query(async () => {
    try {
      return await supabaseRest<Array<Record<string, unknown>>>("inquiries?select=*,properties(title,slug)&order=created_at.desc");
    } catch (error) {
      if (isSchemaUnavailable(error)) return [];
      throw error;
    }
  }),
  updateStatus: adminProcedure.input(z.object({ id: z.string().uuid(), status: z.enum(["New", "Contacted", "Closed"]) })).mutation(async ({ input }) => {
    await supabaseRest(`inquiries?id=eq.${encodeURIComponent(input.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: input.status }),
    });
    return { success: true };
  }),
});
