import { invoiceRouter } from "@/server/api/routers/invoice";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { syncRouter } from "@/server/api/routers/sync";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  invoice: invoiceRouter,
  sync: syncRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
