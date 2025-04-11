"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@prisma/client";

interface InvoiceDetailsProps {
  invoice: Invoice;
  isEditing: boolean;
  editedInvoice: Invoice;
  handleInvoiceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InvoiceDetails({
  invoice,
  isEditing,
  editedInvoice,
  handleInvoiceChange,
}: InvoiceDetailsProps) {
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
              value={
                isEditing
                  ? editedInvoice.invoiceNumber
                  : invoice.invoiceNumber
              }
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
                  ? editedInvoice.invoiceDate.toISOString().split("T")[0]
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
              value={isEditing ? editedInvoice.vendorName : invoice.vendorName}
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
                  ? (editedInvoice.vendorCode ?? "")
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
                  ? (editedInvoice.propertyCode ?? "")
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
                  ? editedInvoice.invoiceDueDate?.toISOString().split("T")[0]
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
                  ? (editedInvoice.apAccount ?? "")
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
                  ? (editedInvoice.cashAccount ?? "")
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
                  ? (editedInvoice.expenseType ?? "")
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
              value={
                isEditing
                  ? editedInvoice.subTotalAmount.toString()
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
              value={
                isEditing
                  ? (editedInvoice.taxAmount ?? "")
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
              value={
                isEditing ? editedInvoice.totalAmount : invoice.totalAmount
              }
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
