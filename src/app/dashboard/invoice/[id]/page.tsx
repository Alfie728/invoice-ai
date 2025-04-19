import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";
import { api, HydrateClient } from "@/trpc/server";

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
        <InvoiceTabsContainer invoiceId={id} />
      </div>
    </HydrateClient>
  );
}
