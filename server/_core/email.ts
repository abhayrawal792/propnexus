import nodemailer from "nodemailer";
import { ENV } from "./env";

export type OwnerInquiryEmail = {
  name: string;
  phone: string;
  email?: string;
  message: string;
  propertyId: string;
};

export async function sendOwnerInquiryEmail(input: OwnerInquiryEmail): Promise<boolean> {
  if (!ENV.smtpUser || !ENV.smtpPass || !ENV.ownerAlertEmail) return false;

  const transport = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465,
    auth: { user: ENV.smtpUser, pass: ENV.smtpPass },
  });

  await transport.sendMail({
    from: ENV.smtpUser,
    to: ENV.ownerAlertEmail,
    replyTo: input.email || undefined,
    subject: `New PropNexus inquiry from ${input.name}`,
    text: [
      `Property ID: ${input.propertyId}`,
      `Name: ${input.name}`,
      `Phone: ${input.phone}`,
      `Email: ${input.email || "Not provided"}`,
      "",
      input.message,
    ].join("\n"),
  });

  return true;
}
