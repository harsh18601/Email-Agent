import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchGmailEmails, getEmailDetails } from "@/lib/gmail";
import { analyzeEmail } from "@/lib/groq";
import { storeEmailVector } from "@/lib/rag";

/**
 * Vercel Cron Job entry point or Manual Trigger
 * To simulate/test: GET /api/emails/fetch
 */
export async function GET(request: Request) {
  // 1. Authenticate (Session-based for manual trigger or CRON_SECRET for background)
  const session = await auth();
  const authHeader = request.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!session && !isCron && process.env.NODE_ENV === "production") {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use session email or a dummy email for background processing
  const userEmail = session?.user?.email || "background-service";
  const accessToken = (session as any)?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ success: false, message: "No access token found in session." }, { status: 400 });
  }

    try {
    // 2. Fetch latest email IDs
    console.log(`[Aether Ingest] Initializing scan for ${userEmail}...`);
    const emailIds = await fetchGmailEmails(accessToken, 5); 
    console.log(`[Aether Ingest] Found ${emailIds.length} candidate messages.`);

    const results = [];

    // 3. Process each email
    for (const id of emailIds) {
      try {
        console.log(`[Aether Ingest] Processing message ID: ${id}`);
        const emailData = await getEmailDetails(accessToken, id);

        // AI Analysis - Truncated for token safety
        console.log(`[Aether Ingest] Running neural analysis for: ${emailData.subject}`);
        const truncatedBody = emailData.body.substring(0, 4000);
        const analysis = await analyzeEmail(emailData.sender, emailData.subject, truncatedBody);

        // Unified Storage in Upstash Vector
        console.log(`[Aether Ingest] Indexing into neural grid...`);
        await storeEmailVector(id, `${emailData.subject} ${emailData.body}`, {
          user_email: userEmail,
          sender: emailData.sender,
          subject: emailData.subject,
          summary: analysis.summary,
          urgency: analysis.urgency,
          importance_score: analysis.importance_score,
          received_at: emailData.receivedAt.toISOString(),
          category: analysis.category,
        });

        results.push({ id, status: "processed" });
      } catch (err: any) {
        console.error(`[Aether Ingest] Error on message ${id}:`, err.message);
        results.push({ id, status: "error", error: err.message });
      }
    }

    console.log(`[Aether Ingest] Sync complete. Processed ${results.length} nodes.`);
    return NextResponse.json({ success: true, processed: results.length });
  } catch (error: any) {
    console.error("Ingestion Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
