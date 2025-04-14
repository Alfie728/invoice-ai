import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { InvoiceCurrency, InvoiceStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const invoiceRouter = createTRPCRouter({
  getAllInvoices: publicProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.db.invoice.findMany({
      include: {
        invoiceLineItem: true,
      },
    });
    if (!invoices) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No invoices found" });
    }

    return invoices.map((invoice) => ({
      ...invoice,
      subTotalAmount: invoice.invoiceLineItem.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      ),
      totalAmount: invoice.invoiceLineItem.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      ),
    }));
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
      // Calculate the subtotal of the invoice
      const subTotalAmount = invoice.invoiceLineItem.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      );

      return {
        ...invoice,
        subTotalAmount,
        totalAmount: subTotalAmount + (invoice.taxAmount ?? 0),
      };
    }),

  updateInvoice: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          invoiceStatus: z.nativeEnum(InvoiceStatus).optional(),
          invoiceNumber: z.string().optional(),
          invoiceDate: z.date().optional(),
          invoiceDueDate: z.date().nullable().optional(),
          vendorName: z.string().optional(),
          taxAmount: z.number().nullable().optional(),
          vendorCode: z.string().nullable().optional(),
          propertyCode: z.string().nullable().optional(),
          invoiceCurrency: z.nativeEnum(InvoiceCurrency).optional(),
          apAccount: z.string().nullable().optional(),
          cashAccount: z.string().nullable().optional(),
          expenseType: z.string().nullable().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      console.log(data);

      // Update the invoice with proper nested update format
      const updatedInvoice = await ctx.db.invoice.update({
        where: { id },
        data,
      });

      return updatedInvoice;
    }),

  updateInvoiceItem: publicProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        id: z.string(),
        data: z.object({
          description: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          glCode: z.string().nullable(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { invoiceId, id, data } = input;
      const updatedInvoiceItem = await ctx.db.invoiceLineItem.update({
        where: { invoiceId, id },
        data,
      });
      return updatedInvoiceItem;
    }),
});
