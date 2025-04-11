import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";
import { api } from "@/trpc/server";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const invoiceData = await api.invoice.getInvoiceById({
    id,
  });

  return (
    <div className="container mx-auto px-8 py-6">
      <InvoiceTabsContainer initialInvoice={invoiceData} />
    </div>
  );
}
