import { google } from "googleapis";
import { convert } from "html-to-text";
import { env } from "@/lib/env";

export type EmailContext = {
  subject: string;
  from: string;
  date: string;
  body: string;      // first 300 chars
  direction: 'received' | 'sent'; // received = from them, sent = user replied
};

function createOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export async function fetchEmailHistoryWithContact(
  accessToken: string,
  contactEmail: string,
  maxResults = 10
): Promise<EmailContext[]> {
  if (process.env.TEST_MODE === "true") {
    return [
      { subject: "Follow up on seed round", from: contactEmail, date: new Date().toISOString(), body: "Let's chat about the seed round tomorrow.", direction: "received" }
    ];
  }
  const authClient = createOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth: authClient });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: `from:${contactEmail} OR to:${contactEmail}`,
    maxResults,
  });

  const messages = res.data.messages;
  if (!messages) return [];

  const threadHistory: EmailContext[] = [];

  for (const message of messages) {
    if (!message.id) continue;
    try {
      const msgDetails = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      const payload = msgDetails.data.payload;
      if (!payload) continue;

      const headers = payload.headers || [];
      const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "No Subject";
      const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "";
      const date = headers.find((h) => h.name?.toLowerCase() === "date")?.value || "";

      let bodyData = "";
      if (payload.parts) {
        const part = payload.parts.find(
          (p) => p.mimeType === "text/plain" || p.mimeType === "text/html"
        );
        if (part?.body?.data) bodyData = part.body.data;
      } else if (payload.body?.data) {
        bodyData = payload.body.data;
      }

      let bodyText = "";
      if (bodyData) {
        const decoded = Buffer.from(bodyData, "base64url").toString("utf-8");
        bodyText = convert(decoded, { wordwrap: 130 }).slice(0, 300);
      } else {
        bodyText = (msgDetails.data.snippet || "").slice(0, 300);
      }

      threadHistory.push({
        subject,
        from,
        date: new Date(date).toISOString(),
        body: bodyText,
        direction: from.toLowerCase().includes(contactEmail.toLowerCase()) ? "received" : "sent",
      });
    } catch (e) {
      console.warn(`[contact-history] Error fetching message details`, e);
    }
  }

  return threadHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getTopSenders(
  accessToken: string,
  maxResults = 20
): Promise<{ email: string; name: string; count: number }[]> {
  if (process.env.TEST_MODE === "true") {
    return [{ email: "investor@example.com", name: "Investor", count: 1 }];
  }
  const authClient = createOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth: authClient });

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 100,
    q: "-from:me",
  });

  const messages = res.data.messages;
  if (!messages) return [];

  const counts = new Map<string, { name: string; count: number }>();

  for (const message of messages) {
    if (!message.id) continue;
    try {
      const msgDetails = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["From"],
      });

      const fromHeader = msgDetails.data.payload?.headers?.[0]?.value;
      if (!fromHeader) continue;

      // Filter out automated emails
      const lower = fromHeader.toLowerCase();
      if (
        lower.includes("noreply") ||
        lower.includes("no-reply") ||
        lower.includes("notifications") ||
        lower.includes("mailer-daemon") ||
        lower.includes("donotreply")
      ) {
        continue;
      }

      // Parse "Name <email@domain.com>"
      const match = fromHeader.match(/(.*)<(.+?)>/);
      let name = "";
      let email = "";
      if (match) {
        name = match[1].replace(/"/g, "").trim();
        email = match[2].trim();
      } else {
        email = fromHeader.trim();
        name = email.split("@")[0];
      }

      if (email) {
        const existing = counts.get(email);
        if (existing) {
          existing.count++;
        } else {
          counts.set(email, { name: name || email, count: 1 });
        }
      }
    } catch (e) {
      // ignore individual message fetch errors
    }
  }

  return Array.from(counts.entries())
    .map(([email, data]) => ({ email, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxResults);
}
