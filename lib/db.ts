import { Index } from "@upstash/vector";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL || "",
  token: process.env.UPSTASH_VECTOR_REST_TOKEN || "",
});

export interface EmailData {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  urgency: string;
  importance_score: number;
  received_at: string;
  user_email: string;
  category: string;
  body?: string;
}

const urgencyOrder: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export async function initDb() {
  // No-op for Upstash Vector
  console.log("Upstash Vector initialized as primary storage.");
  return true;
}

export async function saveEmail() {
  // Use a placeholder vector if we don't have one yet, or handle it in the RAG layer
  // For now, we assume the RAG layer handles the actual embedding
  // This saveEmail is now just a wrapper for the upsert
  return true; 
}

export async function getEmails(userEmail: string, limit = 50) {
  try {
    // We query for the user's emails using metadata filtering
    // Since we want the 'latest', and Upstash Vector doesn't have native 'sort by date',
    // we fetch them and sort in-memory (fine for small dashboard feeds)
    console.log(`[Aether DB] Querying neural grid for: ${userEmail}`);
    const results = await index.query({
      data: "latest messages", // Use the embedding model for reliable retrieval
      filter: `user_email = '${userEmail}'`,
      topK: limit,
      includeMetadata: true,
    });

    console.log(`[Aether DB] Found ${results.length} intelligence nodes in grid.`);

    return results
      .map((r) => {
        const metadata = (r.metadata as unknown as Partial<EmailData>) ?? {};
        return {
          sender: metadata.sender ?? "",
          subject: metadata.subject ?? "",
          summary: metadata.summary ?? "",
          urgency: metadata.urgency ?? "Low",
          importance_score: metadata.importance_score ?? 0,
          received_at: metadata.received_at ?? new Date(0).toISOString(),
          user_email: metadata.user_email ?? userEmail,
          category: metadata.category ?? "Uncategorized",
          body: metadata.body,
          id: r.id,
        };
      })
      .sort((a, b) => {
        const urgencyDelta = (urgencyOrder[a.urgency] ?? 99) - (urgencyOrder[b.urgency] ?? 99);
        if (urgencyDelta !== 0) return urgencyDelta;

        const scoreDelta = b.importance_score - a.importance_score;
        if (scoreDelta !== 0) return scoreDelta;

        return new Date(b.received_at).getTime() - new Date(a.received_at).getTime();
      });
  } catch (error) {
    console.error("Upstash Fetch Error:", error);
    return [];
  }
}
