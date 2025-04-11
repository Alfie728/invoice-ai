// This is now a server component
import { InvoiceTabsContainer } from "@/components/invoice/InvoiceTabsContainer";
import type { InvoiceType } from "@/types/invoice";

// Sample invoice data - in a real app, this would come from a database
const getInvoiceData = (id: string): InvoiceType => {
  return {
    id: "INV-002",
    date: "2023-04-18",
    vendor: "Tech Solutions Inc.",
    vendorCode: "TECH-001",
    propertyCode: "HQ-MAIN",
    dueDate: "2023-05-18",
    apAccount: "AP-2023-002",
    cashAccount: "CASH-MAIN-001",
    subTotal: 3000.65,
    taxAmount: 450.1,
    expenseType: "Office Equipment",
    totalAmount: 3450.75,
    status: "pending",
    lineItems: [
      {
        id: 1,
        description: "Laptop Computer - Model XPS",
        quantity: 2,
        unitPrice: 1200.0,
        glCode: "EQUIP-001",
        total: 2400.0,
      },
      {
        id: 2,
        description: "External Monitor - 27 inch",
        quantity: 2,
        unitPrice: 300.0,
        glCode: "EQUIP-002",
        total: 600.0,
      },
      {
        id: 3,
        description: "Keyboard and Mouse Set",
        quantity: 2,
        unitPrice: 50.0,
        glCode: "EQUIP-003",
        total: 100.0,
      },
    ],
  };
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // In a real app, this would fetch data from an API or database
  const invoiceData = getInvoiceData(id);

  return (
    <div className="container mx-auto py-6 px-8">
      <InvoiceTabsContainer initialInvoice={invoiceData} />
    </div>
  );
}
