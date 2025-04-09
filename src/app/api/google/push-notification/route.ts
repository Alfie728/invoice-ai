import { NextResponse, type NextRequest } from "next/server";

interface GoogleNotification {
  // The actual payload is the main body when unwrapping is enabled
  historyId?: string;
  emailAddress?: string;
  // Additional fields that might be present
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const data = (await request.json()) as GoogleNotification;
  console.log(data);

  return NextResponse.json({ success: 200 });
}
