import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSyncStatus } from "@/server/sync-helper";
export const syncRouter = createTRPCRouter({
  status: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.account?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const syncStatus = await getSyncStatus(ctx.session.account.id);

    return syncStatus;
  }),

  startWatching: protectedProcedure
    .input(
      z.object({
        labelIds: z.array(
          z.enum([
            "CATEGORY_FORUMS",
            "CATEGORY_PERSONAL",
            "CATEGORY_PROMOTIONS",
            "CATEGORY_SOCIAL",
            "CATEGORY_UPDATES",
            "CHAT",
            "DRAFT",
            "IMPORTANT",
            "INBOX",
            "SENT",
            "SPAM",
            "STARRED",
            "TRASH",
            "UNREAD",
          ]),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const session = ctx.session;
        if (!session) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const { labelIds } = input;
        const topicName = process.env.GMAIL_WATCH_TOPIC_NAME;
        if (!topicName) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "GMAIL_WATCH_TOPIC_NAME is not set",
          });
        }

        const watchResponse = await ctx.gmail.users.watch({
          userId: "me",
          requestBody: {
            labelIds,
            topicName,
          },
        });

        await ctx.db.syncStatus.upsert({
          where: {
            accountId: ctx.session?.account?.id,
          },
          create: {
            lastHistoryId: watchResponse.data.historyId,
            lastSyncedAt: new Date(),
            watchExpiration: watchResponse.data.expiration
              ? new Date(parseInt(watchResponse.data.expiration, 10))
              : undefined,
            account: {
              connect: {
                id: ctx.session?.account?.id,
              },
            },
          },
          update: {
            lastHistoryId: watchResponse.data.historyId,
            lastSyncedAt: new Date(),
            watchExpiration: watchResponse.data.expiration
              ? new Date(parseInt(watchResponse.data.expiration, 10))
              : undefined,
          },
        });

        return watchResponse;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to watch labels",
        });
      }
    }),
});
