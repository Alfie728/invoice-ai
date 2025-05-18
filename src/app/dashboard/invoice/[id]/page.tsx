import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";
import { api, HydrateClient, getQueryClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InvoiceErrorFallback } from "@/components/error/InvoiceErrorFallback";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TRPCError } from "@trpc/server";
export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery(api.invoice.byId.queryOptions({ id }));
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      return <div>Invoice not found</div>;
    }
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      return <div>Unauthorized</div>;
    }
    console.error(error);
    throw error;
  }

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
