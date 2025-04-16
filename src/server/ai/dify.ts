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
    glCode: string | null;
  }>;
  additionalCharges: Array<{
    chargeName: string;
    amount: number;
  }> | null;
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
  const result = JSON.parse(
    workflowRunResponse.data.outputs.text,
  ) as ParsedInvoiceData;

  console.log(
    "Raw invoiceDueDate:",
    result.invoiceDueDate,
    typeof result.invoiceDueDate,
  );
  console.log("Raw vendorCode:", result.vendorCode, typeof result.vendorCode);

  console.log(
    "Raw additionalCharges:",
    result.additionalCharges,
    typeof result.additionalCharges,
  );

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
        invoiceNumber: result.invoiceNumber,
        invoiceDate: result.invoiceDate ? new Date(result.invoiceDate) : "",
        invoiceDueDate: result.invoiceDueDate
          ? new Date(result.invoiceDueDate)
          : null,
        vendorName: result.vendorName,
        taxAmount: result.taxAmount,
        vendorCode: result.vendorCode,
        propertyCode: result.propertyCode,
        invoiceCurrency: result.invoiceCurrency as InvoiceCurrency,
        apAccount: result.apAccount,
        cashAccount: result.cashAccount,
        expenseType: result.expenseType,
        invoiceLineItem: {
          create: result.lineItems.map((lineItem) => ({
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
