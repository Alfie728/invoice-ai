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

interface LineItemsProps {
  invoiceLineItem: InvoiceLineItem[];
  isEditing: boolean;
  handleLineItemChange: (
    id: string,
    field: string,
    value: string | number,
  ) => void;
}

export function LineItems({
  invoiceLineItem,
  isEditing,
  handleLineItemChange,
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
            {invoiceLineItem.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleLineItemChange(
                          item.id,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    item.description
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(
                          item.id,
                          "quantity",
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    item.quantity
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleLineItemChange(
                          item.id,
                          "unitPrice",
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    `$${item.unitPrice.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.glCode ?? ""}
                      onChange={(e) =>
                        handleLineItemChange(item.id, "glCode", e.target.value)
                      }
                    />
                  ) : (
                    item.glCode
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${item.amount.toFixed(2)}
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
