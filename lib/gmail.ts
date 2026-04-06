/**
 * Gmail API helper using Google APIs Node.js Client
 */

export interface GmailMessage {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: Date;
}

type GmailListResponse = {
  messages?: Array<{ id: string }>;
};

type GmailHeader = {
  name: string;
  value: string;
};

type GmailPayload = {
  headers?: GmailHeader[];
  body?: {
    data?: string;
  };
  parts?: GmailPayload[];
};

type GmailDetailsResponse = {
  payload: GmailPayload;
  internalDate: string;
  snippet?: string;
};

type GmailApiErrorPayload = {
  error?: {
    message?: string;
    code?: number;
    status?: string;
  };
};

export class GmailApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string
  ) {
    super(message);
    this.name = "GmailApiError";
  }
}

async function parseGmailError(response: Response, fallbackPrefix: string) {
  let payload: GmailApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as GmailApiErrorPayload;
  } catch {
    payload = null;
  }

  const details = payload?.error?.message || response.statusText;
  return new GmailApiError(`${fallbackPrefix}: ${details}`, response.status, details);
}

export async function fetchGmailEmails(accessToken: string, maxResults = 10): Promise<string[]> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=label:INBOX`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw await parseGmailError(response, "Gmail inbox sync failed");
  }

  const data = (await response.json()) as GmailListResponse;
  return (data.messages || []).map((message) => message.id);
}

export async function getEmailDetails(accessToken: string, messageId: string): Promise<GmailMessage> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw await parseGmailError(response, "Gmail message fetch failed");
  }

  const data = (await response.json()) as GmailDetailsResponse;
  const headers = data.payload.headers || [];

  const subject = headers.find((header) => header.name === "Subject")?.value || "No Subject";
  const sender = headers.find((header) => header.name === "From")?.value || "Unknown Sender";
  const receivedAt = new Date(parseInt(data.internalDate));

  // Recursive function to extract body from multipart emails
  const getBody = (payload: GmailPayload): string => {
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, "base64").toString();
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        const body = getBody(part);
        if (body) return body;
      }
    }
    return "";
  };

  const body = getBody(data.payload) || data.snippet || "";

  return {
    id: messageId,
    sender,
    subject,
    snippet: data.snippet || "",
    body,
    receivedAt,
  };
}

export async function sendEmail(accessToken: string, to: string, subject: string, body: string) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${to}`,
    `Content-Type: text/html; charset=utf-8`,
    `MIME-Version: 1.0`,
    `Subject: ${utf8Subject}`,
    "",
    body,
  ];
  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    }
  );

  if (!response.ok) {
    throw await parseGmailError(response, "Gmail send failed");
  }

  return response.json();
}
