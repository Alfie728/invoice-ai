"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@uidotdev/usehooks";
import { InvoiceTabContent } from "@/components/invoice/InvoiceTabContent";
import { useInvoiceSort } from "@/hooks/useInvoiceSort";
import { api } from "@/trpc/react";

export default function InvoiceTabs() {
  const [sortBy, setSortBy, sortOrder, setSortOrder] = useInvoiceSort();
  const [senderEmail, setSenderEmail] = useState<string>("");
  const debouncedSenderEmail = useDebounce(senderEmail, 1000);

  const [invoicesData] = api.invoice.all.useSuspenseQuery({
    sortBy: sortBy,
    sortOrder: sortOrder,
    senderEmail: debouncedSenderEmail,
  });

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setSortBy(
      sortBy as
        | "invoiceDate"
        | "vendorName"
        | "totalAmount"
        | "invoiceStatus"
        | null,
    );
    setSortOrder(sortOrder as "asc" | "desc" | null);
  };

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList className="flex gap-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <Input
          placeholder="Search your invoices"
          value={senderEmail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSenderEmail(e.target.value)
          }
          className="w-1/2"
        />
      </div>
      <TabsContent value="all" className="space-y-4">
        <InvoiceTabContent
          title="All Invoices"
          description="Showing all invoices from the system. Click on an invoice to view details."
          invoices={invoicesData ?? []}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </TabsContent>
      <TabsContent value="pending" className="space-y-4">
        <InvoiceTabContent
          title="Pending Invoices"
          description="Invoices awaiting approval. These can be edited."
          invoices={invoicesData ?? []}
          status={InvoiceStatus.PENDING}
        />
      </TabsContent>
      <TabsContent value="approved" className="space-y-4">
        <InvoiceTabContent
          title="Approved Invoices"
          description="Invoices that have been approved for payment."
          invoices={invoicesData ?? []}
          status={InvoiceStatus.APPROVED}
        />
      </TabsContent>
      <TabsContent value="rejected" className="space-y-4">
        <InvoiceTabContent
          title="Rejected Invoices"
          description="Invoices that have been rejected and require attention."
          invoices={invoicesData ?? []}
          status={InvoiceStatus.REJECTED}
        />
      </TabsContent>
    </Tabs>
  );
}
