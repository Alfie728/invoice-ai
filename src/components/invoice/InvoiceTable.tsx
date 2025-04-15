import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Edit,
  Eye,
  MoreHorizontal,
  X,
} from "lucide-react";
import { InvoiceStatus, type Invoice } from "@prisma/client";
import { toast } from "sonner";
import { api } from "@/trpc/react";

interface InvoiceTableProps {
  invoices: (Invoice & {
    subTotalAmount: number;
    totalAmount: number;
  })[];
  status?: InvoiceStatus | null;
  sortBy?:
    | "invoiceDate"
    | "vendorName"
    | "totalAmount"
    | "invoiceStatus"
    | null;
  sortOrder?: "asc" | "desc" | null;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
}

export function InvoiceTable({
  invoices,
  sortBy,
  sortOrder,
  onSortChange,
}: InvoiceTableProps) {
  const router = useRouter();
  const { mutate: updateInvoice } =
    api.invoice.updateInvoiceWithLineItems.useMutation();
  const utils = api.useUtils();

  const handleRowClick = (invoiceId: string, e: React.MouseEvent) => {
    // Prevent navigation if clicking on or inside the dropdown menu
    if (
      (e.target as HTMLElement).closest('[data-dropdown-trigger="true"]') ||
      (e.target as HTMLElement).closest('[role="menu"]')
    ) {
      return;
    }
    router.push(`/dashboard/invoice/${invoiceId}`);
  };

  const handleStatusUpdate = (invoiceId: string, status: InvoiceStatus) => {
    updateInvoice(
      {
        id: invoiceId,
        invoiceDetails: {
          invoiceStatus: status,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Invoice ${status === InvoiceStatus.APPROVED ? "approved" : "rejected"} successfully`,
          );
          void utils.invoice.getAllInvoices.invalidate();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">
            <Button variant="ghost" className="p-0 font-medium">
              Invoice #
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              className="p-0 font-medium"
              onClick={() => {
                onSortChange?.(
                  "invoiceDate",
                  sortOrder === "asc" ? "desc" : "asc",
                );
              }}
            >
              Date
              {sortBy === "invoiceDate" && sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : sortBy === "invoiceDate" && sortOrder === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              className="p-0 font-medium"
              onClick={() => {
                onSortChange?.(
                  "vendorName",
                  sortOrder === "asc" ? "desc" : "asc",
                );
              }}
            >
              Vendor
              {sortBy === "vendorName" && sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : sortBy === "vendorName" && sortOrder === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button
              variant="ghost"
              className="p-0 font-medium"
              onClick={() => {
                onSortChange?.(
                  "totalAmount",
                  sortOrder === "asc" ? "desc" : "asc",
                );
              }}
            >
              Amount
              {sortBy === "totalAmount" && sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : sortBy === "totalAmount" && sortOrder === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              className="p-0 font-medium"
              onClick={() => {
                onSortChange?.(
                  "invoiceStatus",
                  sortOrder === "asc" ? "desc" : "asc",
                );
              }}
            >
              Status
              {sortBy === "invoiceStatus" && sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : sortBy === "invoiceStatus" && sortOrder === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice.id}
            onClick={(e) => handleRowClick(invoice.id, e)}
            className="hover:bg-muted/50 cursor-pointer"
          >
            <TableCell className="font-medium">
              {invoice.invoiceNumber}
            </TableCell>
            <TableCell>
              {invoice.invoiceDate.toISOString().split("T")[0]}
            </TableCell>
            <TableCell>{invoice.vendorName}</TableCell>
            <TableCell className="text-right">
              ${invoice.subTotalAmount + (invoice.taxAmount ?? 0)}
            </TableCell>
            <TableCell>
              <InvoiceStatusBadge status={invoice.invoiceStatus} />
            </TableCell>
            <TableCell className="text-right">
              <InvoiceActions
                invoice={invoice}
                onStatusUpdate={handleStatusUpdate}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const variant =
    status === "APPROVED"
      ? "approved"
      : status === "PENDING"
        ? "pending"
        : "rejected";

  return <Badge variant={variant}>{status}</Badge>;
}

interface InvoiceActionsProps {
  invoice: Invoice;
  onStatusUpdate: (invoiceId: string, status: InvoiceStatus) => void;
}

function InvoiceActions({ invoice, onStatusUpdate }: InvoiceActionsProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          data-dropdown-trigger="true"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-dropdown-content="true">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/invoice/${invoice.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </Link>
        </DropdownMenuItem>

        {invoice.invoiceStatus === "PENDING" && (
          <>
            <DropdownMenuItem
              onClick={() => {
                router.push(`/dashboard/invoice/${invoice.id}/edit`);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusUpdate(invoice.id, InvoiceStatus.APPROVED)}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusUpdate(invoice.id, InvoiceStatus.REJECTED)}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </>
        )}

        {invoice.invoiceStatus === "APPROVED" && (
          <DropdownMenuItem
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
            onClick={() => onStatusUpdate(invoice.id, InvoiceStatus.REJECTED)}
          >
            <X className="mr-2 h-4 w-4" />
            Mark as rejected
          </DropdownMenuItem>
        )}

        {invoice.invoiceStatus === "REJECTED" && (
          <DropdownMenuItem
            className="text-green-600 focus:bg-green-50 focus:text-green-600"
            onClick={() => onStatusUpdate(invoice.id, InvoiceStatus.APPROVED)}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark as approved
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
