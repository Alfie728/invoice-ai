import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const invoiceRouter = createTRPCRouter({
  invoices: publicProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.db.invoice.findMany({
      where: {
        invoiceCurrency: "USD",
      },
    });
    if (!invoices) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No invoices found" });
    }
    return invoices;
  }),
});
