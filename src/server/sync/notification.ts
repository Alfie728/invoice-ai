import { google } from "googleapis";
import oauth2Client from "../auth/oauth2Client";
import { db } from "../db";
import { processHistories } from "@/server/sync/history";
import { getSyncStatus } from "@/server/sync/syncStatus";

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
