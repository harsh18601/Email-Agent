"use server";

import { auth } from "@/auth";
import { getEmails } from "@/lib/db";
import { fetchGmailEmails, GmailApiError } from "@/lib/gmail";

const DEFAULT_EMAIL_LIMIT = 50;

export async function fetchUserEmails() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const emails = await getEmails(session.user.email, DEFAULT_EMAIL_LIMIT);
  const accessToken = session.accessToken;

  let activeEmailIds: Set<string> | null = null;
  if (accessToken) {
    try {
      const gmailIds = await fetchGmailEmails(accessToken, DEFAULT_EMAIL_LIMIT);
      activeEmailIds = new Set(gmailIds);
    } catch (error) {
      if (error instanceof GmailApiError && error.status === 403) {
        console.warn(
          "Skipping Gmail sync during dashboard load because inbox-read access is currently forbidden. Falling back to stored intelligence."
        );
      } else {
        console.error("Failed to sync against Gmail during dashboard load:", error);
      }
    }
  }

  const visibleEmails = activeEmailIds
    ? emails.filter((email) => activeEmailIds.has(email.id))
    : emails;
  
  // Transform DB format to UI format if needed
  return visibleEmails.map(e => ({
    id: e.id,
    sender: e.sender,
    subject: e.subject,
    summary: e.summary,
    urgency: e.urgency as "High" | "Medium" | "Low",
    importanceScore: e.importance_score,
    time: new Date(e.received_at).toLocaleString(),
    category: e.category,
  }));
}

export async function triggerSync() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Call the internal API route
  // In a real app, you might use a shared logic function instead of a fetch to yourself
  await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/emails/fetch`, {
    headers: {
      "Cookie": `next-auth.session-token=${process.env.SESSION_TOKEN_MOCK}` // This is tricky in Server Actions
    }
  });
  
  // Alternative: Just call the ingestion logic directly if we extract it for reuse
}
