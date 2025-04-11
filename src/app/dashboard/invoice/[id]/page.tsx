import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto px-8 py-6">
      <InvoiceTabsContainer invoiceId={params.id} />
    </div>
  );
}
