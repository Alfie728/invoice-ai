import { processNotification } from "@/server/sync/notification";
import { NextResponse, type NextRequest } from "next/server";

// The actual payload is the main body when unwrapping is enabled
interface GoogleNotification {
  historyId: string;
  emailAddress: string;
}

// Types for notification handling
interface NotificationEntry {
  latestHistoryId: string;
  emailAddress: string;
  timeoutId: NodeJS.Timeout;
}

// Configuration
const DEBOUNCE_DELAY_MS = 5000; // 5 seconds delay

// In-memory store for pending notifications, keyed by email address
const pendingNotifications = new Map<string, NotificationEntry>();

function debounceNotification(emailAddress: string, historyId: string) {
  // Normalize inputs
  const email = String(emailAddress);
  const id = String(historyId);

  // Clear existing timeout if there is one
  const existingEntry = pendingNotifications.get(email);
  if (existingEntry) {
    clearTimeout(existingEntry.timeoutId);
  }

  // Set new timeout
  const timeoutId = setTimeout(() => {
    void processNotification(email, id);
  }, DEBOUNCE_DELAY_MS);

  // Store/update entry
  pendingNotifications.set(email, {
    latestHistoryId: id,
    emailAddress: email,
    timeoutId,
  });
}

export async function POST(request: NextRequest) {
  const data = (await request.json()) as GoogleNotification;
  const { historyId, emailAddress } = data;

  if (!historyId || !emailAddress) {
    console.error("Invalid request", data);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 200 },
    );
  }

  try {
    // Debounce notification to prevent spam
    debounceNotification(emailAddress, historyId);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to process notification" },
      { status: 200 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
