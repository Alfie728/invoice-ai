"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { InvoiceStatus, type Invoice } from "@prisma/client";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface InvoiceHeaderProps {
  invoice: Invoice;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function InvoiceHeader({
  invoice,
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
  onApprove,
  onReject,
}: InvoiceHeaderProps) {
  const [invoiceStatus, setInvoiceStatus] = useState(invoice.invoiceStatus);
  const isEditable = invoiceStatus === "PENDING";

  useEffect(() => {
    if (!isEditing) {
      setInvoiceStatus(invoice.invoiceStatus);
    }
  }, [invoice.invoiceStatus, isEditing]);

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
              ? "approved"
              : invoice.invoiceStatus === "PENDING"
                ? "pending"
                : "rejected"
          }
        >
          {invoice.invoiceStatus}
        </Badge>
      </div>
      <div className="flex gap-2">
        {isEditable && !isEditing && (
          <Button variant="edit" onClick={() => setIsEditing(true)}>
            Edit Invoice
          </Button>
        )}
        {isEditing && (
          <>
            <Button variant="outline-reject" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={onSave} variant="outline-edit">
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </>
        )}
        {invoice.invoiceStatus === "PENDING" && (
          <>
            <Button variant="approve" onClick={onApprove}>
              Approve
            </Button>
            <Button variant="reject" onClick={onReject}>
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
