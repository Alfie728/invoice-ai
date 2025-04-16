import { env } from "@/env";
import { db } from "@/server/db";
import type { InvoiceCurrency } from "@prisma/client";
import wretch from "wretch";

// Define a type for the file upload response
type DifyFileUploadResponse = {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
};

const api = wretch("https://api.dify.ai/v1")
  .auth(`Bearer ${env.DIFY_API_KEY}`)
  .resolve((r) => r.json());

async function uploadFile(
  pdfBuffer: Buffer,
  filename: string,
): Promise<DifyFileUploadResponse> {
  const formData = new FormData();
  // In Node.js environment, use Blob instead of File
  const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
  // The third parameter to append() sets the filename
  formData.append("file", pdfBlob, filename ?? "invoice.pdf");
  formData.append("user", "invoice06@gmail.com");

  try {
    const response = await api.body(formData).url("/files/upload").post();

    return response as DifyFileUploadResponse;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

type DifyWorkflowRunResponse = {
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: {
      text: string;
    };
  };
  error: string | null;
  elapsed_time: number;
  total_tokens: number;
  total_steps: number;
  created_at: number;
  finished_at: number;
};

// Add a new type for the parsed invoice data
export type ParsedInvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDueDate: string | null;
  vendorName: string;
  taxAmount: number;
  subTotalAmount: number;
  totalAmount: number;
  vendorCode: string | null;
  propertyCode: string | null;
  invoiceCurrency: string;
  apAccount: string | null;
  cashAccount: string | null;
  expenseType: string | null;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    glCode: string | null;
  }>;
};

async function runWorkflow(fileId: string): Promise<DifyWorkflowRunResponse> {
  try {
    // Use the api instance for workflow runs
    const response = await api
      .headers({ "Content-Type": "application/json" })
      .json({
        inputs: {
          file: [
            {
              transfer_method: "local_file",
              upload_file_id: fileId,
              type: "document",
            },
          ],
        },
        response_mode: "blocking",
        user: "invoice06@gmail.com",
      })
      .url("/workflows/run")
      .post();

    return response as DifyWorkflowRunResponse;
  } catch (error) {
    console.error("Error running workflow:", error);
    throw error;
  }
}

export async function processInvoice(
  pdfBuffer: Buffer,
  filename: string,
  invoiceSenderEmail: string,
): Promise<DifyWorkflowRunResponse & { invoiceId: string }> {
  const fileUploadResponse = await uploadFile(pdfBuffer, filename);
  console.log("File uploaded:", fileUploadResponse);
  const workflowRunResponse = await runWorkflow(fileUploadResponse.id);
  console.log("Workflow run:", workflowRunResponse);

  // Parse the JSON string from the text output
  const rawData = JSON.parse(
    workflowRunResponse.data.outputs.text,
  ) as ParsedInvoiceData;

  // Clean up the data - convert string "null" values to actual null
  const parsedInvoiceData = {
    ...rawData,
    invoiceDueDate:
      rawData.invoiceDueDate === "null" ? null : rawData.invoiceDueDate,
    vendorCode: rawData.vendorCode === "null" ? null : rawData.vendorCode,
    propertyCode: rawData.propertyCode === "null" ? null : rawData.propertyCode,
    apAccount: rawData.apAccount === "null" ? null : rawData.apAccount,
    cashAccount: rawData.cashAccount === "null" ? null : rawData.cashAccount,
    expenseType: rawData.expenseType === "null" ? null : rawData.expenseType,
    lineItems: rawData.lineItems.map((item) => ({
      ...item,
      glCode: item.glCode === "null" ? null : item.glCode,
    })),
  } as ParsedInvoiceData;

  console.log("Parsed invoice data:", parsedInvoiceData);

  const invoice = await db.$transaction(async (tx) => {
    await tx.invoiceSender.upsert({
      where: {
        emailAddress: invoiceSenderEmail,
      },
      update: {},
      create: {
        emailAddress: invoiceSenderEmail,
        name: "Invoice AI",
      },
    });

    return tx.invoice.create({
      data: {
        invoiceNumber: parsedInvoiceData.invoiceNumber,
        invoiceDate: parsedInvoiceData.invoiceDate
          ? new Date(parsedInvoiceData.invoiceDate)
          : "",
        invoiceDueDate: parsedInvoiceData.invoiceDueDate
          ? new Date(parsedInvoiceData.invoiceDueDate)
          : null,
        vendorName: parsedInvoiceData.vendorName,
        taxAmount: parsedInvoiceData.taxAmount,
        vendorCode: parsedInvoiceData.vendorCode,
        propertyCode: parsedInvoiceData.propertyCode,
        invoiceCurrency: parsedInvoiceData.invoiceCurrency as InvoiceCurrency,
        apAccount: parsedInvoiceData.apAccount,
        cashAccount: parsedInvoiceData.cashAccount,
        expenseType: parsedInvoiceData.expenseType,
        invoiceLineItem: {
          create: parsedInvoiceData.lineItems.map((lineItem) => ({
            description: lineItem.description,
            quantity: lineItem.quantity,
            unitPrice: lineItem.unitPrice,
            glCode: lineItem.glCode,
          })),
        },
        invoiceSender: {
          connect: {
            emailAddress: invoiceSenderEmail,
          },
        },
      },
    });
  });
  return { ...workflowRunResponse, invoiceId: invoice.id };
}
