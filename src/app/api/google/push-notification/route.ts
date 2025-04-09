import { processNotification } from "@/server/sync-helper";
import { NextResponse, type NextRequest } from "next/server";

// The actual payload is the main body when unwrapping is enabled
interface GoogleNotification {
  historyId: string;
  emailAddress: string;
}

export async function POST(request: NextRequest) {
  const data = (await request.json()) as GoogleNotification;
  const { historyId, emailAddress } = data;

  await processNotification(emailAddress, historyId);

  return NextResponse.json({ success: true }, { status: 200 });
}
