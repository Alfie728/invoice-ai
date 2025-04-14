import { simpleParser, type ParsedMail, type Attachment } from "mailparser";
import { toByteArray } from "base64-js";

export type EmailMetadata = {
  invoiceId: string;
  subject: string;
  from: string;
  date: string;
  text: string;
  html: string;
  messageId?: string;
  inReplyTo?: string;
  references: string | string[];
  aiResponse?: string;
};

export async function parseRawMessage(rawMessage: string): Promise<ParsedMail> {
  const bytes = toByteArray(rawMessage);
  const decodedMessage = Buffer.from(bytes).toString("utf-8");
  return simpleParser(decodedMessage);
}

export function extractPdfAttachment(parsedEmail: ParsedMail): Attachment[] {
  const attachments = parsedEmail.attachments;
  return attachments.filter(
    (attachment) => attachment.contentType === "application/pdf",
  );
}

export function extractEmailMetadata(parsedEmail: ParsedMail): EmailMetadata {
  return {
    invoiceId: "",
    subject: parsedEmail.subject ?? "",
    from: parsedEmail.from?.value?.[0]?.address ?? "",
    date: parsedEmail.date?.toISOString() ?? "",
    text: parsedEmail.text ?? "",
    html: parsedEmail.html || "",
    messageId: parsedEmail.messageId,
    inReplyTo: parsedEmail.inReplyTo,
    references: parsedEmail.references ?? "",
  };
}
