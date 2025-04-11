import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-8 py-6">
      <InvoiceTabsContainer invoiceId={id} />
    </div>
  );
}
