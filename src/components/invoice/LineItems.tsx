"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceLineItem } from "@prisma/client";
import { Trash } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { type } from "os";

interface LineItemsProps {
  invoiceLineItems: InvoiceLineItem[];
  isEditing: boolean;
}

export function LineItems({ invoiceLineItems, isEditing }: LineItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[150px]">Unit Price</TableHead>
              <TableHead className="w-[120px]">GL Code</TableHead>
              <TableHead className="w-[150px] text-right">Total</TableHead>
              {isEditing && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceLineItems.map((item) => (
              <LineItem
                key={item.id}
                invoiceLineItem={item}
                isEditing={isEditing}
              />
            ))}
          </TableBody>
        </Table>

        {isEditing && (
          <Button variant="outline" className="mt-4">
            Add Line Item
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface LineItemProps {
  invoiceLineItem: InvoiceLineItem;
  isEditing: boolean;
}

export function LineItem({ invoiceLineItem, isEditing }: LineItemProps) {
  const [localInvoiceLineItem, setLocalInvoiceLineItem] =
    useState(invoiceLineItem);

  const debouncedInvoiceLineItem = useDebounce(localInvoiceLineItem, 800);

  const utils = api.useUtils();
  const { mutate: updateInvoiceItem } =
    api.invoice.updateInvoiceItem.useMutation({
      onMutate: () => {
        const previousInvoice = utils.invoice.getInvoiceById.getData({
          id: invoiceLineItem.invoiceId,
        });
        if (!previousInvoice) {
          throw new Error("Previous invoice not found");
        }

        // Create updated line items array
        const updatedLineItems = previousInvoice.invoiceLineItem.map((item) =>
          item.id === invoiceLineItem.id ? debouncedInvoiceLineItem : item,
        );

        // Calculate new subTotalAmount
        const newSubTotalAmount = updatedLineItems.reduce(
          (acc, item) => acc + item.unitPrice * item.quantity,
          0,
        );

        // Update the cache
        utils.invoice.getInvoiceById.setData(
          { id: invoiceLineItem.invoiceId },
          {
            ...previousInvoice,
            subTotalAmount: newSubTotalAmount,
            invoiceLineItem: updatedLineItems,
          },
        );
      },
      onSuccess: () => {
        toast.success("Invoice item updated successfully");
        void utils.invoice.getInvoiceById.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleLineItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    // console.log(name, value, type);
    const parsedValue =
      type === "number" ? (value === "" ? null : parseFloat(value)) : value;
    setLocalInvoiceLineItem({
      ...localInvoiceLineItem,
      [name]: parsedValue,
    });
  };

  useEffect(() => {
    updateInvoiceItem({
      invoiceId: invoiceLineItem.invoiceId,
      id: invoiceLineItem.id,
      data: debouncedInvoiceLineItem,
    });
  }, [debouncedInvoiceLineItem]);

  return (
    <TableRow key={invoiceLineItem.id}>
      <TableCell>
        {isEditing ? (
          <Input
            name="description"
            value={localInvoiceLineItem.description}
            onChange={handleLineItemChange}
          />
        ) : (
          invoiceLineItem.description
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            name="quantity"
            type="number"
            value={localInvoiceLineItem.quantity}
            onChange={handleLineItemChange}
          />
        ) : (
          invoiceLineItem.quantity
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            name="unitPrice"
            type="number"
            step="0.01"
            value={localInvoiceLineItem.unitPrice}
            onChange={handleLineItemChange}
          />
        ) : (
          `$${localInvoiceLineItem.unitPrice.toFixed(2)}`
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            name="glCode"
            value={localInvoiceLineItem.glCode ?? ""}
            onChange={handleLineItemChange}
          />
        ) : (
          invoiceLineItem.glCode
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        ${localInvoiceLineItem.unitPrice * localInvoiceLineItem.quantity}
      </TableCell>
      {isEditing && (
        <TableCell>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
