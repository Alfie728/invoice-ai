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
import { useEffect, useState } from "react";

interface LineItemsProps {
  invoiceLineItems: InvoiceLineItem[];
  isEditing: boolean;
  onLineItemsChange: (
    lineItems: InvoiceLineItem[],
    modifiedId?: string,
  ) => void;
}

export function LineItems({
  invoiceLineItems,
  isEditing,
  onLineItemsChange,
}: LineItemsProps) {
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
                onLineItemsChange={onLineItemsChange}
                allLineItems={invoiceLineItems}
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
  onLineItemsChange: (
    lineItems: InvoiceLineItem[],
    modifiedId?: string,
  ) => void;
  allLineItems: InvoiceLineItem[];
}

export function LineItem({
  invoiceLineItem,
  isEditing,
  onLineItemsChange,
  allLineItems,
}: LineItemProps) {
  const [localInvoiceLineItem, setLocalInvoiceLineItem] =
    useState(invoiceLineItem);

  const handleLineItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "number" ? (value === "" ? null : parseFloat(value)) : value;
    const updatedLineItem = {
      ...localInvoiceLineItem,
      [name]: parsedValue,
    };
    setLocalInvoiceLineItem(updatedLineItem);

    const updatedLineItems = allLineItems.map((item) =>
      item.id === invoiceLineItem.id ? updatedLineItem : item,
    );
    onLineItemsChange(updatedLineItems, invoiceLineItem.id);
  };

  useEffect(() => {
    if (!isEditing) {
      setLocalInvoiceLineItem(invoiceLineItem);
    }
  }, [isEditing, invoiceLineItem]);

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
            step="0.1"
            value={localInvoiceLineItem.unitPrice}
            onChange={handleLineItemChange}
          />
        ) : (
          localInvoiceLineItem.unitPrice
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
        {`${(
          localInvoiceLineItem.unitPrice * localInvoiceLineItem.quantity
        ).toFixed(2)}`}
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
