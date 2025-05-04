import InvoiceTabs from "@/components/invoice/InvoiceTabs";
import { api } from "@/trpc/server";
import { Suspense } from "react";

export default async function DashboardPage() {
  void api.invoice.all.prefetch({
    sortBy: "invoiceDate",
    sortOrder: "desc",
    senderEmail: "",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        </div>
        <Suspense fallback={<div>Dashboard suspense loading...</div>}>
          <InvoiceTabs />
        </Suspense>
      </div>
    </div>
  );
}
