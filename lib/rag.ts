import { Index } from "@upstash/vector";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL || "",
  token: process.env.UPSTASH_VECTOR_REST_TOKEN || "",
});

export interface EmailVectorMetadata extends Record<string, any> {
  sender: string;
  subject: string;
  summary: string;
  urgency: "High" | "Medium" | "Low";
  importance_score: number;
  received_at: string;
  user_email: string;
  category: string;
}

export async function storeEmailVector(id: string, text: string, metadata: EmailVectorMetadata) {
  try {
    console.log(`[Aether RAG] Indexing intelligence node: ${id} for ${metadata.user_email}`);
    await index.upsert({
      id,
      data: text,
      metadata,
    });
    console.log(`[Aether RAG] Node ${id} indexed successfully.`);
    return true;
  } catch (error) {
    console.error(`[Aether RAG] Vector Upsert Error for ${id}:`, error);
    return false;
  }
}

export async function searchSimilarEmails(query: string, userEmail: string, topK = 5) {
  try {
    console.log(`[Aether RAG] Neural search triggered: "${query}" for ${userEmail}`);
    const results = await index.query({
      data: query,
      topK,
      filter: `user_email = '${userEmail}'`,
      includeMetadata: true,
    });
    console.log(`[Aether RAG] Found ${results.length} relevant intelligence nodes.`);
    return results;
  } catch (error) {
    console.error("[Aether RAG] Search Error:", error);
    return [];
  }
}
