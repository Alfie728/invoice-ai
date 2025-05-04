import { useState } from "react";

export function useInvoiceSort() {
  const [sortBy, setSortBy] = useState<
    "invoiceDate" | "vendorName" | "totalAmount" | "invoiceStatus" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  return [sortBy, setSortBy, sortOrder, setSortOrder] as const;
}
