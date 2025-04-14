import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import type { ParsedInvoiceData } from "../ai/dify";

interface InvoiceEmailProps {
  invoiceId: string;
  invoiceData: ParsedInvoiceData;
  baseUrl: string;
}

export default function InvoiceEmail({
  invoiceId,
  invoiceData,
  baseUrl = "http://localhost:3000",
}: InvoiceEmailProps) {
  const {
    invoiceNumber,
    invoiceDate,
    invoiceDueDate,
    vendorName,
    taxAmount,
    subTotalAmount,
    totalAmount,
    vendorCode,
    propertyCode,
    invoiceCurrency,
    apAccount,
    cashAccount,
    expenseType,
    lineItems,
  } = invoiceData;
  const previewText = `Invoice ${invoiceNumber} Processed Successfully`;
  console.log(
    "InvoiceEmail props:",
    invoiceNumber,
    invoiceDate,
    vendorName,
    invoiceDueDate,
    subTotalAmount,
    taxAmount,
    totalAmount,
    vendorCode,
  );

  // Helper function to format monetary values with currency
  const formatCurrency = (amount: string | number) => {
    if (!amount) return "0.00";
    return `${amount} ${invoiceCurrency || ""}`.trim();
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>Invoice Parser</Heading>

          <Heading style={heading}>Invoice Processed Successfully</Heading>
          <Text style={date}>March 31, 2025</Text>

          <Hr style={hr} />

          <Text style={paragraph}>
            Successfully processed invoice {invoiceNumber}. Details below:
          </Text>

          <Heading style={subheading}>Invoice Information</Heading>

          <Section style={section}>
            <Row>
              <Column style={column}>
                <Heading style={columnHeading}>Invoice Details</Heading>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Invoice Number:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{invoiceNumber}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Invoice Date:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{invoiceDate}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Vendor:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{vendorName}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Due Date:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{invoiceDueDate || "N/A"}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Sub Total:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{formatCurrency(subTotalAmount)}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Tax Amount:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{formatCurrency(taxAmount)}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Total Amount:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{formatCurrency(totalAmount)}</Text>
                  </Column>
                </Row>
              </Column>

              <Column style={column}>
                <Heading style={columnHeading}>Coding Information</Heading>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Vendor Code:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{vendorCode || "N/A"}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Property Code:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{propertyCode || "N/A"}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Currency:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{invoiceCurrency}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>AP Account:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{apAccount || "N/A"}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Cash Account:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{cashAccount || "N/A"}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={labelColumn}>
                    <Text style={label}>Expense Type:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{expenseType || "N/A"}</Text>
                  </Column>
                </Row>
              </Column>
            </Row>
          </Section>

          <Heading style={subheading}>Line Items</Heading>

          <Section style={tableContainer}>
            <Row style={tableHeader}>
              <Column style={tableHeaderCell}>
                <Text style={tableHeaderText}>Description</Text>
              </Column>
              <Column style={tableHeaderCellSmall}>
                <Text style={tableHeaderText}>Quantity</Text>
              </Column>
              <Column style={tableHeaderCellSmall}>
                <Text style={tableHeaderText}>Unit Price</Text>
              </Column>
              <Column style={tableHeaderCellSmall}>
                <Text style={tableHeaderText}>GL Code</Text>
              </Column>
              <Column style={tableHeaderCellSmall}>
                <Text style={tableHeaderText}>Total</Text>
              </Column>
            </Row>

            {lineItems.map((item, index) => (
              <Row
                key={index}
                style={index % 2 === 0 ? tableRowEven : tableRowOdd}
              >
                <Column style={tableCell}>
                  <Text style={tableCellText}>{item.description || "N/A"}</Text>
                </Column>
                <Column style={tableCellSmall}>
                  <Text style={tableCellText}>{item.quantity}</Text>
                </Column>
                <Column style={tableCellSmall}>
                  <Text style={tableCellText}>
                    {formatCurrency(item.unitPrice)}
                  </Text>
                </Column>
                <Column style={tableCellSmall}>
                  <Text style={tableCellText}>{item.glCode || "N/A"}</Text>
                </Column>
                <Column style={tableCellSmall}>
                  <Text style={tableCellText}>
                    {formatCurrency(item.amount)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Row style={tableFooter}>
              <Column style={{ width: "80%" }}>
                <Text style={tableFooterText}>Total</Text>
              </Column>
              <Column style={{ width: "20%" }}>
                <Text style={tableFooterText}>
                  {formatCurrency(totalAmount)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={actionSection}>
            <Text style={actionText}>
              Action Required: Please review the invoice details above and
              approve or reject this invoice.
            </Text>

            <Row>
              <Column style={buttonColumn}>
                <Button
                  href={`${baseUrl}/dashboard/invoice/${invoiceId}`}
                  style={approveButton}
                >
                  APPROVE INVOICE
                </Button>
              </Column>

              <Column style={buttonColumn}>
                <Button
                  href={`${baseUrl}/dashboard/invoice/${invoiceId}`}
                  style={editButton}
                >
                  EDIT INVOICE
                </Button>
              </Column>

              <Column style={buttonColumn}>
                <Button
                  href={`${baseUrl}/dashboard/invoice/${invoiceId}/reject`}
                  style={rejectButton}
                >
                  REJECT INVOICE
                </Button>
              </Column>
            </Row>

            <Text style={footerText}>
              If approved, this invoice will be routed for upload to Yardi. If
              rejected, you will be asked to provide a reason.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "700px",
};

const logo = {
  color: "#333",
  fontSize: "32px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const heading = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
};

const date = {
  color: "#666",
  fontSize: "16px",
  textAlign: "center" as const,
  margin: "10px 0 30px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  margin: "16px 0",
};

const subheading = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "30px 0 15px",
};

const section = {
  padding: "0",
};

const column = {
  width: "50%",
  padding: "0 10px",
  verticalAlign: "top",
};

const columnHeading = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 10px",
};

const labelColumn = {
  width: "40%",
};

const valueColumn = {
  width: "60%",
};

const label = {
  color: "#525f7f",
  fontSize: "14px",
  margin: "0 0 8px",
};

const value = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px",
};

const tableContainer = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const tableHeader = {
  backgroundColor: "#f6f9fc",
  borderBottom: "1px solid #e6ebf1",
};

const tableHeaderCell = {
  padding: "12px 15px",
  width: "40%",
};

const tableHeaderCellSmall = {
  padding: "12px 15px",
  width: "15%",
};

const tableHeaderText = {
  color: "#525f7f",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
};

const tableRowEven = {
  backgroundColor: "#ffffff",
};

const tableRowOdd = {
  backgroundColor: "#f6f9fc",
};

const tableCell = {
  padding: "12px 15px",
  borderBottom: "1px solid #e6ebf1",
  width: "40%",
};

const tableCellSmall = {
  padding: "12px 15px",
  borderBottom: "1px solid #e6ebf1",
  width: "15%",
};

const tableCellText = {
  color: "#525f7f",
  fontSize: "14px",
  margin: "0",
};

const tableFooter = {
  borderTop: "2px solid #e6ebf1",
  padding: "12px 15px",
};

const tableFooterText = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "right" as const,
};

const actionSection = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  margin: "30px 0 0",
  borderLeft: "4px solid #4299e1",
};

const actionText = {
  color: "#333",
  fontSize: "16px",
  margin: "0 0 20px",
};

const buttonColumn = {
  width: "33.33%",
  padding: "0 5px",
  textAlign: "center" as const,
};

const approveButton = {
  backgroundColor: "#68d391",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 10px",
};

const editButton = {
  backgroundColor: "#4299e1",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 10px",
};

const rejectButton = {
  backgroundColor: "#f56565",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 10px",
};

const footerText = {
  color: "#666",
  fontSize: "14px",
  margin: "20px 0 0",
  textAlign: "center" as const,
};
