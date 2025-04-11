"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceDetails } from "./InvoiceDetails";
import { LineItems } from "./LineItems";
import { InvoiceHistory } from "./InvoiceHistory";
import { InvoiceHeader } from "./InvoiceHeader";
import type { Invoice, InvoiceLineItem } from "@prisma/client";

interface InvoiceTabsContainerProps {
  initialInvoice: Invoice & { invoiceLineItem: InvoiceLineItem[] };
}

export function InvoiceTabsContainer({
  initialInvoice,
}: InvoiceTabsContainerProps) {
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
            invoiceLineItem={
              isEditing ? editedLineItems : invoice.invoiceLineItem
            }
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
