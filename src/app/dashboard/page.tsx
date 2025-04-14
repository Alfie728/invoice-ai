"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceStatus } from "@prisma/client";
import { api } from "@/trpc/react";
import { InvoiceTabContent } from "@/components/invoice/InvoiceTabContent";
import { InvoiceListSkeleton } from "@/components/invoice/InvoiceListSkeleton";

export default function DashboardPage() {
  const { data: invoices, isLoading } = api.invoice.getAllInvoices.useQuery();

  if (isLoading || !invoices) {
    return <InvoiceListSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <InvoiceTabContent
              title="All Invoices"
              description="Showing all invoices from the system. Click on an invoice to view details."
              invoices={invoices}
              showSorting={true}
            />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <InvoiceTabContent
              title="Pending Invoices"
              description="Invoices awaiting approval. These can be edited."
              invoices={invoices}
              status={InvoiceStatus.PENDING}
            />
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <InvoiceTabContent
              title="Approved Invoices"
              description="Invoices that have been approved for payment."
              invoices={invoices}
              status={InvoiceStatus.APPROVED}
            />
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <InvoiceTabContent
              title="Rejected Invoices"
              description="Invoices that have been rejected and require attention."
              invoices={invoices}
              status={InvoiceStatus.REJECTED}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
