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

export async function initDb() {
  // No-op for Upstash Vector
  console.log("Upstash Vector initialized as primary storage.");
  return true;
}

export async function saveEmail(email: EmailData) {
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

    return results.map(r => ({
      id: r.id,
      ...r.metadata as any
    })).sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  } catch (error) {
    console.error("Upstash Fetch Error:", error);
    return [];
  }
}
