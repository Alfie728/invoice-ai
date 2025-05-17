import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";
import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InvoiceErrorFallback } from "@/components/error/InvoiceErrorFallback";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.invoice.byId({ id });

  return (
    <HydrateClient>
      <div className="container mx-auto px-8 py-6">
        <ReactQueryDevtools />
        <ErrorBoundary FallbackComponent={InvoiceErrorFallback}>
          <Suspense
            fallback={
              <div className="p-8 text-center">Invoice suspense loading...</div>
            }
          >
            <InvoiceTabsContainer invoiceId={id} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
