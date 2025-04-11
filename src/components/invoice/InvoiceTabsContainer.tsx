"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceDetails } from "./InvoiceDetails";
import { LineItems } from "./LineItems";
import { InvoiceHistory } from "./InvoiceHistory";
import { InvoiceHeader } from "./InvoiceHeader";
import type { InvoiceType, LineItemType } from "@/types/invoice";

interface InvoiceTabsContainerProps {
  initialInvoice: InvoiceType;
}

export function InvoiceTabsContainer({
  initialInvoice,
}: InvoiceTabsContainerProps) {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);
  const [editedLineItems, setEditedLineItems] = useState(invoice.lineItems);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedInvoice({
      ...editedInvoice,
      [name]: value,
    });
  };

  const handleLineItemChange = (
    id: number,
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
                    : item.total,
            }
          : item,
      ),
    );
  };

  const saveChanges = () => {
    setInvoice({
      ...editedInvoice,
      lineItems: editedLineItems,
      subTotal: editedLineItems.reduce((sum, item) => sum + item.total, 0),
    });
    setIsEditing(false);
  };

  const cancelChanges = () => {
    setEditedInvoice(invoice);
    setEditedLineItems(invoice.lineItems);
    setIsEditing(false);
  };

  return (
    <>
      <InvoiceHeader
        invoiceId={invoice.id}
        status={invoice.status}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        saveChanges={saveChanges}
        cancelChanges={cancelChanges}
      />

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="line-items">Line Items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <InvoiceDetails
            invoice={invoice}
            isEditing={isEditing}
            editedInvoice={editedInvoice}
            handleInvoiceChange={handleInvoiceChange}
          />
        </TabsContent>

        <TabsContent value="line-items">
          <LineItems
            lineItems={isEditing ? editedLineItems : invoice.lineItems}
            isEditing={isEditing}
            handleLineItemChange={handleLineItemChange}
          />
        </TabsContent>

        <TabsContent value="history">
          <InvoiceHistory />
        </TabsContent>
      </Tabs>
    </>
  );
}
