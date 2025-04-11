"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InvoiceType } from "@/types/invoice";

interface InvoiceDetailsProps {
  invoice: InvoiceType;
  isEditing: boolean;
  editedInvoice: InvoiceType;
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
              name="id"
              value={isEditing ? editedInvoice.id : invoice.id}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-date">Invoice Date</Label>
            <Input
              id="invoice-date"
              name="date"
              type="date"
              value={isEditing ? editedInvoice.date : invoice.date}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              name="vendor"
              value={isEditing ? editedInvoice.vendor : invoice.vendor}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-code">Vendor Code</Label>
            <Input
              id="vendor-code"
              name="vendorCode"
              value={isEditing ? editedInvoice.vendorCode : invoice.vendorCode}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-code">Property Code</Label>
            <Input
              id="property-code"
              name="propertyCode"
              value={isEditing ? editedInvoice.propertyCode : invoice.propertyCode}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              name="dueDate"
              type="date"
              value={isEditing ? editedInvoice.dueDate : invoice.dueDate}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ap-account">AP Account</Label>
            <Input
              id="ap-account"
              name="apAccount"
              value={isEditing ? editedInvoice.apAccount : invoice.apAccount}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cash-account">Cash Account</Label>
            <Input
              id="cash-account"
              name="cashAccount"
              value={isEditing ? editedInvoice.cashAccount : invoice.cashAccount}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-type">Expense Type</Label>
            <Input
              id="expense-type"
              name="expenseType"
              value={isEditing ? editedInvoice.expenseType : invoice.expenseType}
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
              name="subTotal"
              value={isEditing ? editedInvoice.subTotal : invoice.subTotal}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-amount">Tax Amount</Label>
            <Input
              id="tax-amount"
              name="taxAmount"
              value={isEditing ? editedInvoice.taxAmount : invoice.taxAmount}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total-amount">Total Amount</Label>
            <Input
              id="total-amount"
              name="totalAmount"
              value={isEditing ? editedInvoice.totalAmount : invoice.totalAmount}
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