"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, Trash, X, FileText, Users } from "lucide-react"

// Sample invoice data
const invoiceData = {
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
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState(invoiceData)
  const [isEditing, setIsEditing] = useState(false)
  const [editedInvoice, setEditedInvoice] = useState(invoice)
  const [editedLineItems, setEditedLineItems] = useState(invoice.lineItems)

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedInvoice({
      ...editedInvoice,
      [name]: value,
    })
  }

  const handleLineItemChange = (id: number, field: string, value: string | number) => {
    setEditedLineItems(
      editedLineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "quantity" || field === "unitPrice" ? Number(value) : value,
              total:
                field === "quantity"
                  ? Number(value) * item.unitPrice
                  : field === "unitPrice"
                    ? item.quantity * Number(value)
                    : item.total,
            }
          : item,
      ),
    )
  }

  const saveChanges = () => {
    setInvoice({
      ...editedInvoice,
      lineItems: editedLineItems,
      subTotal: editedLineItems.reduce((sum, item) => sum + item.total, 0),
    })
    setIsEditing(false)
  }

  const cancelChanges = () => {
    setEditedInvoice(invoice)
    setEditedLineItems(invoice.lineItems)
    setIsEditing(false)
  }

  const isEditable = invoice.status === "pending"

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to invoices</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Invoice {params.id}</h1>
          <Badge
            variant={
              invoice.status === "approved" ? "success" : invoice.status === "pending" ? "outline" : "destructive"
            }
          >
            {invoice.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {isEditable && !isEditing && <Button onClick={() => setIsEditing(true)}>Edit Invoice</Button>}
          {isEditing && (
            <>
              <Button variant="outline" onClick={cancelChanges}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveChanges}>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
          {invoice.status === "pending" && (
            <>
              <Button variant="success">Approve</Button>
              <Button variant="destructive">Reject</Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="line-items">Line Items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    name="id"
                    value={isEditing ? editedInvoice.id : invoice.id}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input
                    id="invoice-date"
                    name="date"
                    type="date"
                    value={isEditing ? editedInvoice.date : invoice.date}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={isEditing ? editedInvoice.vendor : invoice.vendor}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor-code">Vendor Code</Label>
                  <Input
                    id="vendor-code"
                    name="vendorCode"
                    value={isEditing ? editedInvoice.vendorCode : invoice.vendorCode}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property-code">Property Code</Label>
                  <Input
                    id="property-code"
                    name="propertyCode"
                    value={isEditing ? editedInvoice.propertyCode : invoice.propertyCode}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    name="dueDate"
                    type="date"
                    value={isEditing ? editedInvoice.dueDate : invoice.dueDate}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ap-account">AP Account</Label>
                  <Input
                    id="ap-account"
                    name="apAccount"
                    value={isEditing ? editedInvoice.apAccount : invoice.apAccount}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cash-account">Cash Account</Label>
                  <Input
                    id="cash-account"
                    name="cashAccount"
                    value={isEditing ? editedInvoice.cashAccount : invoice.cashAccount}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-type">Expense Type</Label>
                  <Input
                    id="expense-type"
                    name="expenseType"
                    value={isEditing ? editedInvoice.expenseType : invoice.expenseType}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sub-total">Sub Total</Label>
                  <Input
                    id="sub-total"
                    name="subTotal"
                    value={isEditing ? editedInvoice.subTotal : invoice.subTotal}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-amount">Tax Amount</Label>
                  <Input
                    id="tax-amount"
                    name="taxAmount"
                    value={isEditing ? editedInvoice.taxAmount : invoice.taxAmount}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total-amount">Total Amount</Label>
                  <Input
                    id="total-amount"
                    name="totalAmount"
                    value={isEditing ? editedInvoice.totalAmount : invoice.totalAmount}
                    onChange={handleInvoiceChange}
                    disabled={!isEditing}
                    className="font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line-items">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[150px]">Unit Price</TableHead>
                    <TableHead className="w-[120px]">GL Code</TableHead>
                    <TableHead className="text-right w-[150px]">Total</TableHead>
                    {isEditing && <TableHead className="w-[80px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isEditing ? editedLineItems : invoice.lineItems).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={item.description}
                            onChange={(e) => handleLineItemChange(item.id, "description", e.target.value)}
                          />
                        ) : (
                          item.description
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, "quantity", e.target.value)}
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(item.id, "unitPrice", e.target.value)}
                          />
                        ) : (
                          `$${item.unitPrice.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={item.glCode}
                            onChange={(e) => handleLineItemChange(item.id, "glCode", e.target.value)}
                          />
                        ) : (
                          item.glCode
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                      {isEditing && (
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {isEditing && (
                <Button variant="outline" className="mt-4">
                  Add Line Item
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Invoice created</p>
                    <p className="text-sm text-muted-foreground">April 18, 2023 at 10:23 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Invoice parsed</p>
                    <p className="text-sm text-muted-foreground">April 18, 2023 at 10:24 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Assigned for review</p>
                    <p className="text-sm text-muted-foreground">April 18, 2023 at 11:30 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
