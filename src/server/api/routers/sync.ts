import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const syncRouter = createTRPCRouter({
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
