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
import { useState } from "react";

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
  const [localDescription, setLocalDescription] = useState(
    invoiceLineItem.description,
  );
  const [localQuantity, setLocalQuantity] = useState(invoiceLineItem.quantity);
  const [localUnitPrice, setLocalUnitPrice] = useState(
    invoiceLineItem.unitPrice,
  );
  const [localGlCode, setLocalGlCode] = useState(invoiceLineItem.glCode);
  const [localAmount, setLocalAmount] = useState(
    invoiceLineItem.unitPrice * invoiceLineItem.quantity,
  );

  const utils = api.useUtils();
  const { mutate: updateInvoiceItem } =
    api.invoice.updateInvoiceItem.useMutation({
      onSuccess: () => {
        toast.success("Invoice item updated successfully");
        void utils.invoice.getInvoiceById.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleLineItemChange = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    console.log(id, field, value);
  };
  return (
    <TableRow key={invoiceLineItem.id}>
      <TableCell>
        {isEditing ? (
          <Input
            value={localDescription}
            onChange={(e) =>
              handleLineItemChange(
                invoiceLineItem.id,
                "description",
                e.target.value,
              )
            }
          />
        ) : (
          invoiceLineItem.description
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            value={localQuantity}
            onChange={(e) =>
              handleLineItemChange(
                invoiceLineItem.id,
                "quantity",
                e.target.value,
              )
            }
          />
        ) : (
          invoiceLineItem.quantity
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={localUnitPrice}
            onChange={(e) =>
              handleLineItemChange(
                invoiceLineItem.id,
                "unitPrice",
                e.target.value,
              )
            }
          />
        ) : (
          `$${localUnitPrice.toFixed(2)}`
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={localGlCode ?? ""}
            onChange={(e) =>
              handleLineItemChange(invoiceLineItem.id, "glCode", e.target.value)
            }
          />
        ) : (
          invoiceLineItem.glCode
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        ${localAmount.toFixed(2)}
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
