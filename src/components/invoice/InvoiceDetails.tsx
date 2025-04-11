"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import type { Invoice } from "@prisma/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
interface InvoiceDetailsProps {
  invoice: Invoice;
  isEditing: boolean;
}

export function InvoiceDetails({ invoice, isEditing }: InvoiceDetailsProps) {
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const utils = api.useUtils();
  const { mutate: updateInvoice } = api.invoice.updateInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice updated successfully");
      void utils.invoice.getInvoiceById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const debouncedInvoice = useDebounce(localInvoice, 1000);

  console.log(debouncedInvoice);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // Convert string values to numbers for numeric fields
    const parsedValue =
      type === "number" ? (value === "" ? null : parseFloat(value)) : value;

    setLocalInvoice({
      ...localInvoice,
      [name]: parsedValue,
    });
  };

  useEffect(() => {
    updateInvoice({
      id: invoice.id,
      data: {
        ...debouncedInvoice,
      },
    });
  }, [debouncedInvoice]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              name="invoiceNumber"
              value={localInvoice.invoiceNumber}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-date">Invoice Date</Label>
            <Input
              id="invoice-date"
              name="invoiceDate"
              type="date"
              value={localInvoice.invoiceDate.toISOString().split("T")[0]}
              onChange={(e) =>
                setLocalInvoice({
                  ...localInvoice,
                  invoiceDate: new Date(e.target.value),
                })
              }
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              name="vendorName"
              value={localInvoice.vendorName}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-code">Vendor Code</Label>
            <Input
              id="vendor-code"
              name="vendorCode"
              value={localInvoice.vendorCode ?? ""}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-code">Property Code</Label>
            <Input
              id="property-code"
              name="propertyCode"
              value={localInvoice.propertyCode ?? ""}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              name="invoiceDueDate"
              type="date"
              value={localInvoice.invoiceDueDate?.toISOString().split("T")[0]}
              onChange={(e) =>
                setLocalInvoice({
                  ...localInvoice,
                  invoiceDueDate: new Date(e.target.value),
                })
              }
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ap-account">AP Account</Label>
            <Input
              id="ap-account"
              name="apAccount"
              value={localInvoice.apAccount ?? ""}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cash-account">Cash Account</Label>
            <Input
              id="cash-account"
              name="cashAccount"
              value={localInvoice.cashAccount ?? ""}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-type">Expense Type</Label>
            <Input
              id="expense-type"
              name="expenseType"
              value={localInvoice.expenseType ?? ""}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sub-total">Sub Total</Label>
            <Input
              id="sub-total"
              name="subTotalAmount"
              type="number"
              value={localInvoice.subTotalAmount.toString()}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-amount">Tax Amount</Label>
            <Input
              id="tax-amount"
              name="taxAmount"
              type="number"
              value={localInvoice.taxAmount?.toString() ?? ""}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total-amount">Total Amount</Label>
            <Input
              id="total-amount"
              name="totalAmount"
              type="number"
              value={
                localInvoice.subTotalAmount + (localInvoice.taxAmount ?? 0)
              }
              disabled
              className="font-bold"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
