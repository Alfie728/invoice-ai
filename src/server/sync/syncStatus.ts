import { db } from "@/server/db";

export async function getSyncStatus(accountId: string) {
  const syncStatus = await db.syncStatus.findUnique({
    where: { accountId },
  });

  return {
    historyId: syncStatus?.lastHistoryId,
    lastSyncedAt: syncStatus?.lastSyncedAt,
  };
}

export async function updateSyncStatus(accountId: string, historyId: string) {
  return db.syncStatus.upsert({
    where: { accountId },
    update: {
      lastHistoryId: historyId,
      lastSyncedAt: new Date(),
    },
    create: {
      accountId,
      lastHistoryId: historyId,
      lastSyncedAt: new Date(),
    },
  });
}
