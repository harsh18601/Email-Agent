import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not defined in environment variables.");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "placeholder",
});

export const LLM_MODEL = "llama-3.3-70b-versatile";

export interface EmailAnalysis {
  summary: string;
  category: "Action Required" | "Informational" | "Promotional" | "Spam";
  urgency: "High" | "Medium" | "Low";
  importance_score: number;
  action_items: string[];
  deadline_detected: boolean;
}

export async function analyzeEmail(content: string, subject: string, sender: string): Promise<EmailAnalysis> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an AI Email Intelligence Assistant. Analyze the provided email and return a JSON object ONLY.
        
        Rules:
        1. Classify the email category.
        2. Determine urgency based on the content and deadlines.
        3. Provide a priority_score from 0 to 100.
        4. Extract a 2-4 line summary.
        5. List specific action items if any.
        
        JSON Format:
        {
          "summary": "string",
          "category": "Action Required | Informational | Promotional | Spam",
          "urgency": "High | Medium | Low",
          "importance_score": number,
          "action_items": ["string"],
          "deadline_detected": boolean
        }`,
      },
      {
        role: "user",
        content: `Subject: ${subject}\nSender: ${sender}\n\nContent: ${content}`,
      },
    ],
    model: LLM_MODEL,
    response_format: { type: "json_object" },
  });

  const res = completion.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(res);
  } catch (e) {
    console.error("Failed to parse Groq response:", res);
    throw new Error("Invalid AI analysis response");
  }
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

export async function composeEmail(
  prompt: string,
  context?: string,
  tone: string = "Professional"
): Promise<EmailDraft> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an AI Email Intelligence Assistant. Generate a professional email draft based on the user prompt and context.
        
        Tone Guidelines:
        - Current Tone: ${tone}
        - Maintain the requested tone strictly.
        
        Context from related emails: ${context || "None provided."}
        
        Rules:
        1. Return ONLY a JSON object.
        2. Identify the recipient's email if mentioned in the prompt or context.
        3. Create a compelling subject line.
        4. Use HTML line breaks (<br/>) for formatting the body.
        
        JSON Format:
        {
          "to": "string",
          "subject": "string",
          "body": "string (HTML)"
        }`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: LLM_MODEL,
    response_format: { type: "json_object" },
  });

  const res = completion.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(res);
  } catch (e) {
    console.error("Failed to parse Compose response:", res);
    throw new Error("Failed to generate draft");
  }
}
