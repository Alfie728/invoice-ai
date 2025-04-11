export interface LineItemType {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  glCode: string;
  total: number;
}

export interface InvoiceType {
  id: string;
  date: string;
  vendor: string;
  vendorCode: string;
  propertyCode: string;
  dueDate: string;
  apAccount: string;
  cashAccount: string;
  subTotal: number;
  taxAmount: number;
  expenseType: string;
  totalAmount: number;
  status: string;
  lineItems: LineItemType[];
}
