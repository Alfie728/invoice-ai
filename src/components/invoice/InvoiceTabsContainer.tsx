"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceDetails } from "./InvoiceDetails";
import { LineItems } from "./LineItems";
import { InvoiceHistory } from "./InvoiceHistory";
import { InvoiceHeader } from "./InvoiceHeader";
import {
  InvoiceStatus,
  type Invoice,
  type InvoiceLineItem,
} from "@prisma/client";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  initialInvoice: Invoice & {
    subTotalAmount: number;
    totalAmount: number;
  } & {
    invoiceLineItem: InvoiceLineItem[];
  };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [subTotalAmount, setSubTotalAmount] = useState(
    initialInvoice.invoiceLineItem.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    ),
  );
  const [lineItems, setLineItems] = useState(initialInvoice.invoiceLineItem);
  const [invoiceDetails, setInvoiceDetails] = useState(initialInvoice);

  const calculateSubTotal = useCallback((lineItems: InvoiceLineItem[]) => {
    const newSubTotal = lineItems.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );
    setSubTotalAmount(newSubTotal);
    setLineItems(lineItems);
  }, []);

  const utils = api.useUtils();
  const { mutate: updateInvoiceWithLineItems } =
    api.invoice.updateInvoiceWithLineItems.useMutation({
      onSuccess: () => {
        toast.success("Invoice updated successfully");
        void utils.invoice.getInvoiceById.invalidate();
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleSaveChanges = () => {
    updateInvoiceWithLineItems({
      id: initialInvoice.id,
      data: invoiceDetails,
      lineItems: lineItems,
    });
  };

  const handleInvoiceChange = (
    updatedInvoice: Invoice & { subTotalAmount: number; totalAmount: number },
  ) => {
    setInvoiceDetails({
      ...updatedInvoice,
      invoiceLineItem: lineItems,
    });
  };

  const handleCancelEdit = () => {
    // Reset all local state to initial values
    setInvoiceDetails(initialInvoice);
    setLineItems(initialInvoice.invoiceLineItem);
    setSubTotalAmount(
      initialInvoice.invoiceLineItem.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      ),
    );
    setIsEditing(false);
  };

  const handleApproveInvoice = () => {
    setInvoiceDetails({
      ...invoiceDetails,
      invoiceStatus: InvoiceStatus.APPROVED,
    });
    updateInvoiceWithLineItems(
      {
        id: initialInvoice.id,
        data: { invoiceStatus: InvoiceStatus.APPROVED },
      },
      {
        onSuccess: () => {
          toast.success("Invoice approved successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleRejectInvoice = () => {
    setInvoiceDetails({
      ...invoiceDetails,
      invoiceStatus: InvoiceStatus.REJECTED,
    });
    updateInvoiceWithLineItems(
      {
        id: initialInvoice.id,
        data: { invoiceStatus: InvoiceStatus.REJECTED },
      },
      {
        onSuccess: () => {
          toast.success("Invoice rejected successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <>
      <InvoiceHeader
        invoice={invoiceDetails}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSave={handleSaveChanges}
        onCancel={handleCancelEdit}
        onApprove={handleApproveInvoice}
        onReject={handleRejectInvoice}
      />

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <InvoiceDetails
            invoice={{
              ...invoiceDetails,
              subTotalAmount,
            }}
            isEditing={isEditing}
            onInvoiceChange={handleInvoiceChange}
          />
          <LineItems
            invoiceLineItems={lineItems}
            isEditing={isEditing}
            onLineItemsChange={calculateSubTotal}
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
