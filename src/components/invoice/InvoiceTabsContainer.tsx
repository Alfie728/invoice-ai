"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceDetails } from "./InvoiceDetails";
import { LineItems } from "./LineItems";
import { InvoiceHistory } from "./InvoiceHistory";
import { InvoiceHeader } from "./InvoiceHeader";
import type { Invoice, InvoiceLineItem } from "@prisma/client";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceTabsContainerProps {
  invoiceId: string;
}

export function InvoiceTabsContainer({ invoiceId }: InvoiceTabsContainerProps) {
  // Client-side data fetching
  const { data: invoice, isLoading } = api.invoice.getInvoiceById.useQuery({
    id: invoiceId,
  });
  // We'll only render the editing components when we have data
  if (isLoading || !invoice) {
    return <InvoiceLoadingSkeleton />;
  }

  return <InvoiceContent initialInvoice={invoice} />;
}

// Separate component for the actual invoice content
function InvoiceContent({
  initialInvoice,
}: {
  initialInvoice: Invoice & { invoiceLineItem: InvoiceLineItem[] };
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <InvoiceHeader
        invoice={initialInvoice}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <InvoiceDetails invoice={initialInvoice} isEditing={isEditing} />
          <LineItems
            invoiceLineItems={initialInvoice.invoiceLineItem}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="history">
          <InvoiceHistory invoiceId={initialInvoice.id} />
        </TabsContent>
      </Tabs>
    </>
  );
}

// Loading skeleton component
function InvoiceLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabs skeleton */}
      <div>
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Invoice details skeleton */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Line items skeleton */}
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
