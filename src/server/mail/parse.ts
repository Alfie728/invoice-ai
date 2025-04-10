import { simpleParser, type ParsedMail, type Attachment } from "mailparser";
import { toByteArray } from "base64-js";

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

export function extractEmailMetadata(parsedEmail: ParsedMail) {
  return {
    subject: parsedEmail.subject,
    from: parsedEmail.from,
    to: parsedEmail.to,
    date: parsedEmail.date,
    text: parsedEmail.text,
    html: parsedEmail.html,
  };
}
