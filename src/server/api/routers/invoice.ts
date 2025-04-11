import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const invoiceRouter = createTRPCRouter({
  getAllInvoices: publicProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.db.invoice.findMany({});
    if (!invoices) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No invoices found" });
    }
    return invoices;
  }),
  getInvoiceById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: {
          id: input.id,
        },
        include: {
          invoiceLineItem: true,
        },
      });
      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }
      return invoice;
    }),
});
