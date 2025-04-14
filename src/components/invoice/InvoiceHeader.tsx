"use client";

import { useState } from "react";
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
  setIsEditing: (value: boolean) => void;
}

export function InvoiceHeader({
  invoice,
  isEditing,
  setIsEditing,
}: InvoiceHeaderProps) {
  const isEditable = invoice.invoiceStatus === "PENDING";

  const utils = api.useUtils();
  const { mutate: updateInvoice } = api.invoice.updateInvoice.useMutation();

  const handleApproveInvoice = () => {
    updateInvoice(
      {
        id: invoice.id,
        data: {
          invoiceStatus: InvoiceStatus.APPROVED,
        },
      },
      {
        onSuccess: () => {
          toast.success("Invoice approved successfully");
          void utils.invoice.getInvoiceById.invalidate();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleRejectInvoice = () => {
    updateInvoice(
      {
        id: invoice.id,
        data: {
          invoiceStatus: InvoiceStatus.REJECTED,
        },
      },
      {
        onSuccess: () => {
          toast.success("Invoice rejected successfully");
          void utils.invoice.getInvoiceById.invalidate();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

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
          <Button onClick={() => setIsEditing(true)}>Edit Invoice</Button>
        )}
        {isEditing && (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={() => setIsEditing(false)}>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </>
        )}
        {invoice.invoiceStatus === "PENDING" && (
          <>
            <Button variant="default" onClick={handleApproveInvoice}>
              Approve
            </Button>
            <Button variant="destructive" onClick={handleRejectInvoice}>
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
