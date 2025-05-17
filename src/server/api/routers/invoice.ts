import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { InvoiceCurrency, InvoiceStatus, Prisma } from "@prisma/client";
import type { Invoice, InvoiceLineItem } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  glCode: z.string().nullable(),
  invoiceId: z.string(),
});

const updateInvoiceWithLineItemsInput = z.object({
  id: z.string(),
  invoiceDetails: z
    .object({
      invoiceStatus: z.nativeEnum(InvoiceStatus).optional(),
      invoiceNumber: z.string().optional(),
      invoiceDate: z.date().optional(),
      invoiceDueDate: z.date().nullable().optional(),
      vendorName: z.string().optional(),
      taxAmount: z.number().optional(),
      vendorCode: z.string().nullable().optional(),
      propertyCode: z.string().nullable().optional(),
      invoiceCurrency: z.nativeEnum(InvoiceCurrency).optional(),
      apAccount: z.string().nullable().optional(),
      cashAccount: z.string().nullable().optional(),
      expenseType: z.string().nullable().optional(),
      additionalCharges: z.any().optional(),
    })
    .partial(),
  lineItems: z.array(lineItemSchema).optional(),
});

// Add this type to handle the raw query result
type RawInvoiceWithTotal = Invoice & {
  invoiceLineItem: InvoiceLineItem[];
  total_amount: number;
};

export const invoiceRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        senderEmail: z.string().optional(),
        sortBy: z
          .enum(["invoiceDate", "vendorName", "totalAmount", "invoiceStatus"])
          .nullable(),
        sortOrder: z.enum(["asc", "desc"]).nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        senderEmail: userEmail,
        sortBy = "invoiceDate",
        sortOrder = "desc",
      } = input;

      if (sortBy === "totalAmount") {
        const invoices = await ctx.db.$queryRaw<RawInvoiceWithTotal[]>`
          SELECT 
            i.*,
            COALESCE(i."taxAmount", 0) + 
            COALESCE(
              (SELECT SUM(ili."unitPrice" * ili."quantity") 
               FROM "InvoiceLineItem" ili 
               WHERE ili."invoiceId" = i.id),
              0
            ) as total_amount,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', il."id",
                  'description', il."description",
                  'quantity', il."quantity",
                  'unitPrice', il."unitPrice",
                  'glCode', il."glCode",
                  'invoiceId', il."invoiceId",
                  'createdAt', il."createdAt",
                  'updatedAt', il."updatedAt"
                )
              ) FILTER (WHERE il."id" IS NOT NULL),
              '[]'
            ) as "invoiceLineItem"
          FROM "Invoice" i
          LEFT JOIN "InvoiceLineItem" il ON il."invoiceId" = i.id
          ${
            userEmail
              ? Prisma.sql`WHERE i."invoiceSenderId" IN (
            SELECT id FROM "InvoiceSender" 
            WHERE "emailAddress" = ${userEmail}
          )`
              : Prisma.empty
          }
          GROUP BY i.id
          ORDER BY total_amount ${sortOrder === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`}
        `;

        return invoices.map((invoice) => {
          const subTotalAmount = invoice.invoiceLineItem.reduce(
            (acc, item) => acc + item.unitPrice * item.quantity,
            0,
          );

          // Calculate additional charges total
          const additionalChargesTotal = invoice.additionalCharges
            ? (
                invoice.additionalCharges as Array<{
                  chargeName: string;
                  amount: number;
                }>
              ).reduce((acc, charge) => acc + charge.amount, 0)
            : 0;

          return {
            ...invoice,
            subTotalAmount,
            totalAmount:
              subTotalAmount +
              (invoice.taxAmount ?? 0) +
              additionalChargesTotal,
          };
        });
      } else {
        const invoices = await ctx.db.invoice.findMany({
          where: {
            ...(userEmail && { invoiceSender: { emailAddress: userEmail } }),
          },
          include: {
            invoiceLineItem: true,
          },
          orderBy: {
            [sortBy ?? "invoiceDate"]: sortOrder ?? "desc",
          },
        });
        if (!invoices) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No invoices found",
          });
        }

        return invoices.map((invoice) => {
          const subTotalAmount = invoice.invoiceLineItem.reduce(
            (acc, item) => acc + item.unitPrice * item.quantity,
            0,
          );

          // Calculate additional charges total
          const additionalChargesTotal = invoice.additionalCharges
            ? (
                invoice.additionalCharges as Array<{
                  chargeName: string;
                  amount: number;
                }>
              ).reduce((acc, charge) => acc + charge.amount, 0)
            : 0;

          return {
            ...invoice,
            subTotalAmount,
            totalAmount:
              subTotalAmount +
              (invoice.taxAmount ?? 0) +
              additionalChargesTotal,
          };
        });
      }
    }),

  byId: publicProcedure
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

      // Calculate additional charges total
      const additionalChargesTotal = invoice.additionalCharges
        ? (
            invoice.additionalCharges as Array<{
              chargeName: string;
              amount: number;
            }>
          ).reduce((acc, charge) => acc + charge.amount, 0)
        : 0;

      return {
        ...invoice,
        subTotalAmount,
        totalAmount:
          subTotalAmount + (invoice.taxAmount ?? 0) + additionalChargesTotal,
      };
    }),

  updateWithLineItems: publicProcedure
    .input(updateInvoiceWithLineItemsInput)
    .mutation(async ({ ctx, input }) => {
      const { id, invoiceDetails, lineItems } = input;

      if (!lineItems) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Line items are required",
        });
      }

      const invoice = await ctx.db.invoice.update({
        where: { id },
        data: {
          ...invoiceDetails,
          invoiceLineItem: {
            deleteMany: {
              invoiceId: id,
              id: {
                notIn: lineItems
                  ?.filter((item) => item.id)
                  .map((item) => item.id!),
              },
            },
            upsert: lineItems?.map((item) => ({
              where: {
                id: item.id ?? "", // use empty string for new line items in where clause
              },
              create: {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                glCode: item.glCode,
              },
              update: {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                glCode: item.glCode,
              },
            })),
          },
        },
      });

      return invoice;
    }),

  update: publicProcedure
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
          additionalCharges: z.any().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      console.log(data);

      // Update the invoice with proper nested update format
      const updatedInvoice = await ctx.db.invoice.update({
        where: { id },
        data: {
          ...data,
          taxAmount: data.taxAmount ?? 0,
        },
      });

      return updatedInvoice;
    }),

  // updateInvoiceItem: publicProcedure
  //   .input(
  //     z.object({
  //       invoiceId: z.string(),
  //       id: z.string(),
  //       data: z.object({
  //         description: z.string(),
  //         quantity: z.number(),
  //         unitPrice: z.number(),
  //         glCode: z.string().nullable(),
  //       }),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { invoiceId, id, data } = input;
  //     const updatedInvoiceItem = await ctx.db.invoiceLineItem.update({
  //       where: { invoiceId, id },
  //       data,
  //     });
  //     return updatedInvoiceItem;
  //   }),
});
