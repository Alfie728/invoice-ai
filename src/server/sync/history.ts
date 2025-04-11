import type { gmail_v1 } from "googleapis";
import {
  extractPdfAttachment,
  parseRawMessage,
  extractEmailMetadata,
  type EmailMetadata,
} from "@/server/mail/parse";
import { composeMail } from "@/server/mail/compose";
import { db } from "@/server/db";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/auth/s3Client";
import { env } from "@/env";
import { processInvoice } from "@/server/ai/dify";

export async function processHistories(
  gmail: gmail_v1.Gmail,
  histories: gmail_v1.Schema$History[],
) {
  console.log("Processing histories:", histories.length);

  // Use a simple Set to track threads that need processing
  const threadsToProcess = new Set<string>();

  // First pass: collect all thread IDs from inbox messages
  for (const history of histories) {
    if (history.messagesAdded) {
      for (const message of history.messagesAdded) {
        if (
          message.message?.labelIds?.includes("INBOX") &&
          !message.message.labelIds.includes("SENT")
        ) {
          // Only track the thread ID, we don't need to track individual message IDs
          threadsToProcess.add(message.message.threadId ?? "");
        }
      }
    }
  }

  console.log(`Found ${threadsToProcess.size} threads to process`);

  // Process each thread
  for (const threadId of threadsToProcess) {
    // Check if we've already replied to this thread
    const existingReply = await db.repliedThread.findUnique({
      where: { threadId },
    });

    if (existingReply) {
      console.log(
        `Thread ${threadId.substring(0, 8)}... already replied to on ${existingReply.repliedAt.toISOString()}, skipping`,
      );
      continue;
    }

    // Get the thread details
    const thread = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "metadata",
    });

    // Find a message in the thread with a PDF attachment
    let emailMetadata: EmailMetadata | null = null;
    let hasPdfAttachment = false;
    let aiResponseText = ""; // Store the AI response

    // Process messages
    const messages = thread.data.messages ?? [];
    for (const message of messages) {
      if (!message.id) continue;

      // Get and parse the message
      const { data } = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "raw",
      });

      if (!data.raw) continue;

      const parsedEmail = await parseRawMessage(data.raw);
      emailMetadata = extractEmailMetadata(parsedEmail);

      // Skip our own messages
      if (emailMetadata.from.includes("invoiceai06@gmail.com")) continue;

      // Check for PDF attachment
      const pdfAttachments = extractPdfAttachment(parsedEmail);
      if (pdfAttachments.length > 0) {
        hasPdfAttachment = true;

        for (const attachment of pdfAttachments) {
          // Upload the PDF to S3
          try {
            // Create a buffer from the attachment content
            const pdfBuffer = Buffer.from(attachment.content);

            const key = `invoices/${emailMetadata.from}/${threadId}/${attachment.filename}.pdf`;

            // First upload the file to S3
            await s3Client.send(
              new PutObjectCommand({
                Bucket: env.BUCKET_NAME,
                Key: key,
                Body: pdfBuffer,
                ContentType: "application/pdf",
              }),
            );

            const response = await processInvoice(
              pdfBuffer,
              attachment.filename ?? "invoice.pdf",
            );

            aiResponseText = response.data.outputs.text;
          } catch (error) {
            console.error("Error processing PDF attachment:", error);
            aiResponseText =
              "Sorry, there was an error processing your invoice. Please try again later.";
          }
        }

        // Store the AI response for use in the email
        emailMetadata.aiResponse = aiResponseText;
      }
    }

    // Skip if no suitable message found
    if (!hasPdfAttachment || !emailMetadata) {
      console.log(
        `Thread ${threadId.substring(0, 8)}... skipped: ${!hasPdfAttachment ? "No PDF attachment" : "No valid metadata"}`,
      );
      continue;
    }

    console.log(
      `Processing thread ${threadId.substring(0, 8)}... from ${emailMetadata.from.substring(0, 15)}...`,
    );

    // Send the reply
    console.log(`Sending reply to thread ${threadId.substring(0, 8)}...`);

    try {
      const mail = await composeMail({
        from: "invoice06@gmail.com",
        to: emailMetadata.from,
        subject: `[Invoice AI] Re: ${emailMetadata.subject}`,
        text:
          emailMetadata.aiResponse ??
          "Thank you for your email. We've received your invoice, but we couldn't process it automatically. Please ensure it's a valid PDF document.",
        inReplyTo: emailMetadata.messageId,
        references: emailMetadata.references,
      });

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: mail,
          threadId: threadId,
        },
      });

      await db.repliedThread.create({
        data: {
          threadId,
          emailAddress: emailMetadata.from,
          subject: emailMetadata.subject,
          messageId: emailMetadata.messageId,
        },
      });

      console.log(
        `Reply sent and recorded in database for thread ${threadId.substring(0, 8)}...`,
      );
    } catch (error) {
      console.error(
        `Error sending reply to thread ${threadId.substring(0, 8)}...:`,
        error,
      );
    }
  }
}
