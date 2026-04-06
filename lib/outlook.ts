/**
 * Microsoft Graph API helper for Outlook integration
 */

export async function fetchOutlookEmails(accessToken: string) {
  // Fetch messages from MS Graph
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/messages?$top=10&$select=subject,sender,body,receivedDateTime",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Graph API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.value || [];
}
