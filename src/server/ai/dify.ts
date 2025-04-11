import { env } from "@/env";
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
    error: string | null;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
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
): Promise<DifyWorkflowRunResponse> {
  const fileUploadResponse = await uploadFile(pdfBuffer, filename);
  console.log("File uploaded:", fileUploadResponse);
  const workflowRunResponse = await runWorkflow(fileUploadResponse.id);
  console.log("Workflow run:", workflowRunResponse);
  return workflowRunResponse;
}
