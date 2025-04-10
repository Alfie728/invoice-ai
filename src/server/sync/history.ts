import { toByteArray } from "base64-js";
import type { gmail_v1 } from "googleapis";
import { type ParsedMail, simpleParser } from "mailparser";

export async function processHistories(
  gmail: gmail_v1.Gmail,
  histories: gmail_v1.Schema$History[],
) {
  const threadIds = new Set<string>();
  const messageIds = new Set<string>();

  for (const history of histories) {
    if (history.messagesAdded) {
      for (const message of history.messagesAdded) {
        threadIds.add(message.message?.threadId ?? "");
      }
    }
  }

  if (threadIds.size > 0) {
    const threadIdsArray = Array.from(threadIds);

    await Promise.all(
      threadIdsArray.map(async (threadId) => {
        const thread = await gmail.users.threads.get({
          userId: "me",
          id: threadId,
          format: "metadata",
        });
        thread.data?.messages?.forEach((m) => m.id && messageIds.add(m.id));
      }),
    );
  }

  if (messageIds.size > 0) {
    const messageIdsArray = Array.from(messageIds);
    console.log("messageIdsArray", messageIdsArray);

    for (const messageId of messageIdsArray) {
      const message = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "raw",
      });
      // console.log("message", message);
      const rawMessage = message.data?.raw;
      if (!rawMessage) return;

      const bytes = toByteArray(rawMessage);
      const decodedMessage = Buffer.from(bytes).toString("utf-8");

      const parsed: ParsedMail = await simpleParser(decodedMessage);

      const attachments = parsed.attachments;
      if (attachments.length > 0) {
        const pdfAttachment = attachments.find(
          (attachment) => attachment.contentType === "application/pdf",
        );
        if (pdfAttachment) {
          console.log("pdf detected");
        }
      }
    }
  }
}
