import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { ENV } from "./env";

export type ComparisonPropertyEmail = {
  title: string;
  location: string;
  city: string;
  price: string;
  propertyType: string;
  areaSize: string;
  bedrooms: number;
  status: string;
};

function buildComparisonPdf(properties: ComparisonPropertyEmail[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    document.on("data", chunk => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
    document.fillColor("#10243a").fontSize(22).font("Helvetica-Bold").text("PropNexus");
    document.moveDown(0.35).fillColor("#8e6b32").fontSize(10).font("Helvetica-Bold").text("PROPERTY COMPARISON BRIEF");
    document.moveDown(0.5).fillColor("#64748b").fontSize(9).font("Helvetica").text(`Prepared ${new Date().toLocaleDateString("en-NP")}`);
    document.moveDown(1.5);
    properties.forEach((property, index) => {
      if (index > 0) document.moveDown(1.2);
      document.fillColor("#10243a").fontSize(16).font("Helvetica-Bold").text(property.title);
      document.moveDown(0.25).fillColor("#64748b").fontSize(10).font("Helvetica").text(`${property.location}, ${property.city}`);
      document.moveDown(0.5).fillColor("#10243a").fontSize(11).font("Helvetica-Bold").text(property.price);
      document.moveDown(0.35).fontSize(9).font("Helvetica").text(`Type: ${property.propertyType}    Area: ${property.areaSize}    Bedrooms: ${property.bedrooms || "—"}    Status: ${property.status}`);
      document.moveTo(48, document.y + 14).lineTo(547, document.y + 14).strokeColor("#d7b16c").stroke();
    });
    document.moveDown(2).fillColor("#64748b").fontSize(9).font("Helvetica").text("PropNexus · Contact Abhay at +977 9769279600 or rawalabhaya!@gmail.com for current availability and viewings.");
    document.end();
  });
}

export async function sendComparisonPdfEmail(recipient: string, properties: ComparisonPropertyEmail[]): Promise<boolean> {
  if (!ENV.smtpUser || !ENV.smtpPass || !ENV.ownerAlertEmail) return false;
  const pdf = await buildComparisonPdf(properties);
  const transport = nodemailer.createTransport({ host: ENV.smtpHost, port: ENV.smtpPort, secure: ENV.smtpPort === 465, auth: { user: ENV.smtpUser, pass: ENV.smtpPass } });
  await transport.sendMail({
    from: ENV.smtpUser,
    to: recipient,
    replyTo: ENV.ownerAlertEmail,
    subject: `PropNexus property comparison · ${properties.length} saved ${properties.length === 1 ? "property" : "properties"}`,
    text: "Attached is your PropNexus property comparison brief. Contact Abhay at +977 9769279600 for current availability and viewings.",
    attachments: [{ filename: "propnexus-property-comparison.pdf", content: pdf, contentType: "application/pdf" }],
  });
  return true;
}
