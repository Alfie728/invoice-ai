"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import type { Invoice } from "@prisma/client";

interface InvoiceHeaderProps {
  invoice: Invoice;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
}

export function InvoiceHeader({
  invoice,
  isEditing,
  setIsEditing,
  saveChanges,
  cancelChanges,
}: InvoiceHeaderProps) {
  const isEditable = invoice.invoiceStatus === "PENDING";

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to invoices</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
        <Badge
          variant={
            invoice.invoiceStatus === "APPROVED"
              ? "default"
              : invoice.invoiceStatus === "PENDING"
                ? "outline"
                : "destructive"
          }
        >
          {invoice.invoiceStatus}
        </Badge>
      </div>
      <div className="flex gap-2">
        {isEditable && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Invoice</Button>
        )}
        {isEditing && (
          <>
            <Button variant="outline" onClick={cancelChanges}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={saveChanges}>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </>
        )}
        {invoice.invoiceStatus === "PENDING" && (
          <>
            <Button variant="default">Approve</Button>
            <Button variant="destructive">Reject</Button>
          </>
        )}
      </div>
    </div>
  );
}
