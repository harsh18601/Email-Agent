import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { composeEmail } from "@/lib/groq";
import { searchSimilarEmails } from "@/lib/rag";
import { sendEmail } from "@/lib/gmail";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, prompt, tone, draft } = await req.json();
  const userEmail = session.user.email;
  const accessToken = (session as any)?.accessToken;

  try {
    if (action === "compose") {
      // 1. Fetch Context from RAG (Inbox memory)
      const similarityResults = await searchSimilarEmails(prompt, userEmail, 3);
      const context = similarityResults
        .map((r) => `[Subject: ${r.metadata?.subject}] ${r.metadata?.summary}`)
        .join("\n");

      // 2. Generate Draft with Tone
      const response = await composeEmail(prompt, context || "No previous context found.", tone || "Professional");
      return NextResponse.json(response);
    }

    if (action === "send") {
      if (!accessToken) throw new Error("Missing access token");
      if (!draft || !draft.to || !draft.subject || !draft.body) {
        throw new Error("Incomplete draft provided.");
      }

      await sendEmail(accessToken, draft.to, draft.subject, draft.body);
      return NextResponse.json({ success: true, message: "Matrix Dispatched" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Assistant API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
