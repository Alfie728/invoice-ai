"use client";

import type React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Edit, MoreHorizontal, X } from "lucide-react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { data: invoices, isLoading } = api.invoice.getAllInvoices.useQuery();

  const handleRowClick = (invoiceId: string, e: React.MouseEvent) => {
    // Prevent navigation if clicking on the dropdown menu
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger="true"]')) {
      return;
    }
    router.push(`/dashboard/invoice/${invoiceId}`);
  };

  if (isLoading || !invoices) {
    return <InvoiceListSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>
                  Showing all invoices from the system. Click on an invoice to
                  view details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button variant="ghost" className="p-0 font-medium">
                          Invoice #
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium">
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium">
                          Vendor
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" className="p-0 font-medium">
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.map((invoice) => (
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
                        </TableCell>
                        <TableCell className="text-right">
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
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/invoice/${invoice.id}`}>
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              {invoice.invoiceStatus === "PENDING" && (
                                <>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {invoice.invoiceStatus === "APPROVED" && (
                                <DropdownMenuItem>
                                  <X className="mr-2 h-4 w-4" />
                                  Mark as rejected
                                </DropdownMenuItem>
                              )}
                              {invoice.invoiceStatus === "REJECTED" && (
                                <DropdownMenuItem>
                                  <Check className="mr-2 h-4 w-4" />
                                  Mark as approved
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                <CardDescription>
                  Invoices awaiting approval. These can be edited.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      ?.filter((invoice) => invoice.invoiceStatus === "PENDING")
                      .map((invoice) => (
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
                            <Badge variant="outline">
                              {invoice.invoiceStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
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
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/invoices/${invoice.id}`}>
                                    View details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved Invoices</CardTitle>
                <CardDescription>
                  Invoices that have been approved for payment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      ?.filter(
                        (invoice) => invoice.invoiceStatus === "APPROVED",
                      )
                      .map((invoice) => (
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
                            <Badge variant="default">
                              {invoice.invoiceStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
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
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/invoices/${invoice.id}`}>
                                    View details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <X className="mr-2 h-4 w-4" />
                                  Mark as rejected
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Invoices</CardTitle>
                <CardDescription>
                  Invoices that have been rejected and require attention.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      ?.filter(
                        (invoice) => invoice.invoiceStatus === "REJECTED",
                      )
                      .map((invoice) => (
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
                            <Badge variant="destructive">
                              {invoice.invoiceStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
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
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/invoices/${invoice.id}`}>
                                    View details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Check className="mr-2 h-4 w-4" />
                                  Mark as approved
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InvoiceListSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Card skeleton */}
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          {/* Card header skeleton */}
          <div className="flex flex-col space-y-1.5 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-96" />
          </div>

          {/* Card content skeleton */}
          <div className="p-6 pt-0">
            {/* Table header skeleton */}
            <div className="flex w-full border-b pb-4">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="ml-8 h-5 w-[100px]" />
              <Skeleton className="ml-8 h-5 w-[150px]" />
              <Skeleton className="mr-24 ml-auto h-5 w-[100px]" />
              <Skeleton className="mr-8 h-5 w-[100px]" />
              <Skeleton className="h-5 w-[100px]" />
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex w-full items-center border-b py-4"
              >
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="ml-8 h-5 w-[100px]" />
                <Skeleton className="ml-8 h-5 w-[150px]" />
                <Skeleton className="mr-24 ml-auto h-5 w-[80px]" />
                <Skeleton className="mr-8 h-6 w-[80px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
