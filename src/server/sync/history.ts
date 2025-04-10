import type { gmail_v1 } from "googleapis";
import {
  extractPdfAttachment,
  parseRawMessage,
  extractEmailMetadata,
  type EmailMetadata,
} from "@/server/mail/parse";
import { composeMail } from "@/server/mail/compose";
import { db } from "../db";

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

    // Process messages in reverse order (newest first) to find the most recent PDF
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
        break;
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
        text: "test",
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
