import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvoiceTable } from "@/components/invoice/InvoiceTable";
import { type InvoiceStatus, type Invoice } from "@prisma/client";

interface InvoiceTabContentProps {
  title: string;
  description: string;
  invoices: (Invoice & {
    subTotalAmount: number;
    totalAmount: number;
  })[];
  status?: InvoiceStatus | null;
  sortBy?:
    | "invoiceDate"
    | "vendorName"
    | "totalAmount"
    | "invoiceStatus"
    | null;
  sortOrder?: "asc" | "desc" | null;
  showSorting?: boolean;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
}

export function InvoiceTabContent({
  title,
  description,
  invoices,
  status,
  sortBy,
  sortOrder,
  onSortChange,
}: InvoiceTabContentProps) {
  // Filter invoices by status if provided
  const filteredInvoices = status
    ? invoices.filter((invoice) => invoice.invoiceStatus === status)
    : invoices;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <InvoiceTable
          invoices={filteredInvoices}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </CardContent>
    </Card>
  );
}
