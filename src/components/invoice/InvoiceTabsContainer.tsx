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
  const [invoice, setInvoice] = useState(initialInvoice);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);
  const [editedLineItems, setEditedLineItems] = useState(
    invoice.invoiceLineItem,
  );

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedInvoice({
      ...editedInvoice,
      [name]: value,
    });
  };

  const handleLineItemChange = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    setEditedLineItems(
      editedLineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "unitPrice"
                  ? Number(value)
                  : value,
              total:
                field === "quantity"
                  ? Number(value) * item.unitPrice
                  : field === "unitPrice"
                    ? item.quantity * Number(value)
                    : item.amount,
            }
          : item,
      ),
    );
  };

  const saveChanges = () => {
    setInvoice({
      ...editedInvoice,
      invoiceLineItem: editedLineItems,
      subTotalAmount: editedLineItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      ),
    });
    setIsEditing(false);
  };

  const cancelChanges = () => {
    setEditedInvoice(invoice);
    setEditedLineItems(invoice.invoiceLineItem);
    setIsEditing(false);
  };

  return (
    <>
      <InvoiceHeader
        invoice={invoice}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        saveChanges={saveChanges}
        cancelChanges={cancelChanges}
      />

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <InvoiceDetails
            invoice={invoice}
            isEditing={isEditing}
            editedInvoice={editedInvoice}
            handleInvoiceChange={handleInvoiceChange}
          />
          <LineItems
            invoiceLineItem={
              isEditing ? editedLineItems : invoice.invoiceLineItem
            }
            isEditing={isEditing}
            handleLineItemChange={handleLineItemChange}
          />
        </TabsContent>

        <TabsContent value="history">
          <InvoiceHistory invoiceId={invoice.id} />
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
