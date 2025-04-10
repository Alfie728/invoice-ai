import type { gmail_v1 } from "googleapis";
import { extractPdfAttachment, parseRawMessage } from "@/server/mail/parse";
import { composeMail } from "@/server/mail/compose";
import { updateSyncStatus } from "./syncStatus";

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

    for (const messageId of messageIdsArray) {
      const message = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "raw",
      });
      const rawMessage = message.data?.raw;
      if (!rawMessage) return;

      const parsedEmail = await parseRawMessage(rawMessage);
      const pdfAttachment = extractPdfAttachment(parsedEmail);
      if (pdfAttachment) {
        console.log("pdf detected");
        // const mail = await composeMail({
        //   from: "invoice06@gmail.com",
        //   to: "invoice06@gmail.com",
        //   subject: "Reply to invoice",
        //   text: "test",
        // });

        // const messageResponse = await gmail.users.messages.send({
        //   userId: "me",
        //   requestBody: {
        //     raw: mail,
        //   },
        // });
        // console.log(messageResponse);
      }
    }
  }
}
