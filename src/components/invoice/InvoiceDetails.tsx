"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import type { Invoice } from "@prisma/client";
import { toast } from "sonner";

interface InvoiceDetailsProps {
  invoice: Invoice;
  isEditing: boolean;
}

export function InvoiceDetails({ invoice, isEditing }: InvoiceDetailsProps) {
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
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.name, e.target.value);
  };
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
              value={isEditing ? invoice.invoiceNumber : invoice.invoiceNumber}
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
              value={
                isEditing
                  ? invoice.invoiceDate.toISOString().split("T")[0]
                  : invoice.invoiceDate.toISOString().split("T")[0]
              }
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              name="vendorName"
              value={isEditing ? invoice.vendorName : invoice.vendorName}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-code">Vendor Code</Label>
            <Input
              id="vendor-code"
              name="vendorCode"
              value={
                isEditing
                  ? (invoice.vendorCode ?? "")
                  : (invoice.vendorCode ?? "")
              }
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-code">Property Code</Label>
            <Input
              id="property-code"
              name="propertyCode"
              value={
                isEditing
                  ? (invoice.propertyCode ?? "")
                  : (invoice.propertyCode ?? "")
              }
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
              value={
                isEditing
                  ? invoice.invoiceDueDate?.toISOString().split("T")[0]
                  : invoice.invoiceDueDate?.toISOString().split("T")[0]
              }
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ap-account">AP Account</Label>
            <Input
              id="ap-account"
              name="apAccount"
              value={
                isEditing
                  ? (invoice.apAccount ?? "")
                  : (invoice.apAccount ?? "")
              }
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cash-account">Cash Account</Label>
            <Input
              id="cash-account"
              name="cashAccount"
              value={
                isEditing
                  ? (invoice.cashAccount ?? "")
                  : (invoice.cashAccount ?? "")
              }
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-type">Expense Type</Label>
            <Input
              id="expense-type"
              name="expenseType"
              value={
                isEditing
                  ? (invoice.expenseType ?? "")
                  : (invoice.expenseType ?? "")
              }
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
              value={
                isEditing
                  ? invoice.subTotalAmount.toString()
                  : invoice.subTotalAmount.toString()
              }
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
              value={
                isEditing
                  ? (invoice.taxAmount ?? "")
                  : (invoice.taxAmount ?? "")
              }
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
              value={isEditing ? invoice.totalAmount : invoice.totalAmount}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
              className="font-bold"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
