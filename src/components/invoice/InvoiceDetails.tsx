"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@prisma/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// Define the AdditionalCharge type to match the schema
type AdditionalCharge = {
  chargeName: string;
  amount: number;
};

interface InvoiceDetailsProps {
  invoice: Invoice & { subTotalAmount: number; totalAmount: number };
  isEditing: boolean;
  onInvoiceChange: (
    invoice: Invoice & { subTotalAmount: number; totalAmount: number },
  ) => void;
}

export function InvoiceDetails({
  invoice,
  isEditing,
  onInvoiceChange,
}: InvoiceDetailsProps) {
  const [localInvoice, setLocalInvoice] = useState(invoice);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "number" ? (value === "" ? null : parseFloat(value)) : value;
    const updatedInvoice = {
      ...localInvoice,
      [name]: parsedValue,
    };
    setLocalInvoice(updatedInvoice);
    onInvoiceChange(updatedInvoice);
  };

  const handleAdditionalChargeChange = (
    index: number,
    field: keyof AdditionalCharge,
    value: string,
  ) => {
    // Safely cast the additionalCharges to the correct type
    const additionalCharges = Array.isArray(localInvoice.additionalCharges)
      ? (localInvoice.additionalCharges as AdditionalCharge[])
      : [];

    if (additionalCharges.length === 0) return;

    const updatedCharges = [...additionalCharges];
    const currentCharge = updatedCharges[index]
      ? { ...updatedCharges[index] }
      : { chargeName: "", amount: 0 };

    if (field === "amount") {
      currentCharge.amount = parseFloat(value) ?? 0;
    } else {
      currentCharge.chargeName = value;
    }

    updatedCharges[index] = currentCharge;

    const updatedInvoice = {
      ...localInvoice,
      additionalCharges: updatedCharges,
    };

    setLocalInvoice(updatedInvoice);
    onInvoiceChange(updatedInvoice);
  };

  const addAdditionalCharge = () => {
    // Safely cast the additionalCharges to the correct type
    const currentCharges = Array.isArray(localInvoice.additionalCharges)
      ? (localInvoice.additionalCharges as AdditionalCharge[])
      : [];

    const updatedCharges = [...currentCharges, { chargeName: "", amount: 0 }];

    const updatedInvoice = {
      ...localInvoice,
      additionalCharges: updatedCharges,
    };

    setLocalInvoice(updatedInvoice);
    onInvoiceChange(updatedInvoice);
  };

  const removeAdditionalCharge = (index: number) => {
    // Safely cast the additionalCharges to the correct type
    const additionalCharges = Array.isArray(localInvoice.additionalCharges)
      ? (localInvoice.additionalCharges as AdditionalCharge[])
      : [];

    if (additionalCharges.length === 0) return;

    const updatedCharges = [...additionalCharges];
    updatedCharges.splice(index, 1);

    const updatedInvoice = {
      ...localInvoice,
      // If no charges remain, set to null to ensure proper handling in the database
      additionalCharges: updatedCharges.length > 0 ? updatedCharges : null,
    };

    setLocalInvoice(updatedInvoice);
    onInvoiceChange(updatedInvoice);
  };

  useEffect(() => {
    if (!isEditing) {
      setLocalInvoice(invoice);
    }
  }, [isEditing, invoice]);

  // Calculate the total additional charges
  const additionalChargesTotal = Array.isArray(localInvoice.additionalCharges)
    ? (localInvoice.additionalCharges as AdditionalCharge[]).reduce(
        (acc, charge) => acc + charge.amount,
        0,
      )
    : 0;

  // Check if there are additional charges to display
  const hasAdditionalCharges =
    Array.isArray(localInvoice.additionalCharges) &&
    (localInvoice.additionalCharges as AdditionalCharge[]).length > 0;

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sub-total">Sub Total</Label>
            <Input
              id="sub-total"
              name="subTotalAmount"
              type="number"
              value={invoice.subTotalAmount.toFixed(2)}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-amount">Tax Amount</Label>
            <Input
              id="tax-amount"
              name="taxAmount"
              type="number"
              value={localInvoice.taxAmount ?? ""}
              onChange={handleInvoiceChange}
              disabled={!isEditing}
            />
          </div>

          {additionalChargesTotal > 0 && (
            <div className="space-y-2">
              <Label htmlFor="additional-charges-total">
                Additional Charges Total
              </Label>
              <Input
                id="additional-charges-total"
                type="number"
                value={additionalChargesTotal.toFixed(2)}
                disabled
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="total-amount">Total Amount</Label>
            <Input
              id="total-amount"
              name="totalAmount"
              type="number"
              value={`${(
                invoice.subTotalAmount +
                (invoice.taxAmount ?? 0) +
                additionalChargesTotal
              ).toFixed(2)}`}
              disabled
              className="font-bold"
            />
          </div>
        </div>
        <Separator className="my-6" />

        {/* Additional Charges Section */}
        {(hasAdditionalCharges || isEditing) && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-md font-medium">Additional Charges</h3>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAdditionalCharge}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Charge
                </Button>
              )}
            </div>

            {hasAdditionalCharges ? (
              <div className="mb-6 space-y-4">
                {(localInvoice.additionalCharges as AdditionalCharge[]).map(
                  (charge, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`charge-name-${index}`}>Name</Label>
                        <Input
                          id={`charge-name-${index}`}
                          value={charge.chargeName}
                          onChange={(e) =>
                            handleAdditionalChargeChange(
                              index,
                              "chargeName",
                              e.target.value,
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`charge-amount-${index}`}>Amount</Label>
                        <Input
                          id={`charge-amount-${index}`}
                          type="number"
                          value={charge.amount}
                          onChange={(e) =>
                            handleAdditionalChargeChange(
                              index,
                              "amount",
                              e.target.value,
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="mt-8"
                          onClick={() => removeAdditionalCharge(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : isEditing ? (
              <div className="bg-muted/50 mb-6 rounded-md p-4 text-center">
                <p className="text-muted-foreground text-sm">
                  No additional charges. Click &quot;Add Charge&quot; to add
                  one.
                </p>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
