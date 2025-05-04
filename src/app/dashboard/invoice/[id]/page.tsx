import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";
import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.invoice.byId.prefetch({ id });

  return (
    <HydrateClient>
      <div className="container mx-auto px-8 py-6">
        <Suspense fallback={<div>Invoice suspense loading...</div>}>
          <InvoiceTabsContainer invoiceId={id} />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
