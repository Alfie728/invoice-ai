import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import PdfParse from "pdf-parse";
import { env } from "@/env";

export async function processInvoice(pdfContent: Buffer | undefined) {
  console.log(pdfContent);
  if (!pdfContent) return null;

  // 1. Parse the PDF file
  const pdfData = await PdfParse(pdfContent, {
    // Disable any internal tests by providing explicit options
    version: "v2.0.550",
  });
  const pdfText = pdfData.text;

  // 2. Initialize OpenRouter client
  const openrouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
  });
  const model = openrouter("openai/gpt-4o-mini");

  // 3. Process with AI via OpenRouter
  const response = streamText({
    model,
    prompt: `
      You are an invoice processing assistant.
      Extract the following information from this invoice:
      - Invoice number
      - Date
      - Vendor name
      - Line items with quantities and prices
      - Total amount
      - Payment terms
      
      Format the output as JSON.
      
      Here is the invoice text:
      ${pdfText}
    `,
  });

  await response.consumeStream();
  return response.text;
}
