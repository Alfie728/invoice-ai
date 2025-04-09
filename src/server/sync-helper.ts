import { google } from "googleapis";
import oauth2Client from "@/server/auth/oauth2Client";
import { db } from "@/server/db";
import { type gmail_v1 } from "googleapis/build/src/apis/gmail";
import { simpleParser, type ParsedMail } from "mailparser";
import { toByteArray } from "base64-js";

export async function getSyncStatus(accountId: string) {
  const syncStatus = await db.syncStatus.findUnique({
    where: {
      accountId,
    },
  });

  return {
    historyId: syncStatus?.lastHistoryId,
    lastSyncedAt: syncStatus?.lastSyncedAt,
  };
}

export async function processNotification(
  emailAddress: string,
  historyId: string,
) {
  const user = await db.user.findUnique({
    where: {
      email: emailAddress,
    },
    select: {
      accounts: {
        where: {
          provider: "google",
        },
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
        },
      },
    },
  });

  const account = user?.accounts[0];
  if (!account) {
    throw new Error("Account not found");
  }

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account?.expires_at,
  });

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const { historyId: syncStatusHistoryId } = await getSyncStatus(account.id);

  const histories = await gmail.users.history.list({
    userId: "me",
    historyTypes: ["messageAdded", "messageDeleted"],
    startHistoryId: syncStatusHistoryId ?? historyId ?? "",
  });

  await processHistories(gmail, histories.data.history ?? []);
}

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
