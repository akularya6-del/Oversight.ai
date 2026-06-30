import { google, gmail_v1 } from "googleapis";
import { convert } from "html-to-text";
import { env } from "@/lib/env";
import { logger, TraceContext } from "@/lib/observability";

function createOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

function extractBody(payload: gmail_v1.Schema$MessagePart | undefined | null): string {
  // Recursively search payload parts for plain text, then HTML as fallback
  if (!payload) return "";

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  if (payload.mimeType === "text/html" && payload.body?.data) {
    const html = Buffer.from(payload.body.data, "base64").toString("utf-8");
    return convert(html, { wordwrap: false });
  }

  if (payload.parts) {
    // Prefer text/plain first
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
    // Fall back to HTML
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = Buffer.from(part.body.data, "base64").toString("utf-8");
        return convert(html, { wordwrap: false });
      }
    }
    // Recurse into nested parts
    for (const part of payload.parts) {
      const body = extractBody(part);
      if (body) return body;
    }
  }

  return "";
}

export async function fetchRecentEmails(
  accessToken: string,
  maxResults = 20,
  trace?: TraceContext
): Promise<
  Array<{ id: string; subject: string; from: string; date: string; body: string }>
> {
  return logger.measure("GoogleWorkspace", "fetchRecentEmails", async () => {
    if (process.env.TEST_MODE === "true") {
      return [
        { id: "mock-1", subject: "Follow up on seed round", from: "investor@example.com", date: new Date().toISOString(), body: "Let's chat about the seed round tomorrow." },
        { id: "mock-2", subject: "Weekly Engineering Sync", from: "eng@example.com", date: new Date().toISOString(), body: "Here are the notes for the weekly sync." }
      ];
    }
    try {
      const auth = createOAuth2Client(accessToken);
    const gmail = google.gmail({ version: "v1", auth });

    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      labelIds: ["INBOX"],
    });

    const messages = listResponse.data.messages ?? [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "full",
          });

          const headers = detail.data.payload?.headers ?? [];
          const subject =
            headers.find((h) => h.name === "Subject")?.value ?? "(No Subject)";
          const from =
            headers.find((h) => h.name === "From")?.value ?? "Unknown";
          const date =
            headers.find((h) => h.name === "Date")?.value ?? "";

          const rawBody = extractBody(detail.data.payload);
          // Limit to first 500 chars — keeps LLM context small and avoids token overflow
          const body = rawBody.trim().slice(0, 500);

          return { id: msg.id!, subject, from, date, body };
        } catch {
          return null;
        }
      })
    );

    return emails.filter(Boolean) as Array<{
      id: string;
      subject: string;
      from: string;
      date: string;
      body: string;
    }>;
    } catch (error) {
      logger.error("GoogleWorkspace", "fetchRecentEmails failed", { error: String(error) }, trace);
      return [];
    }
  }, trace);
}

export async function fetchLast24hEmails(
  accessToken: string,
  trace?: TraceContext
): Promise<Array<{ id: string; subject: string; from: string; date: string; body: string }>> {
  return logger.measure("GoogleWorkspace", "fetchLast24hEmails", async () => {
    if (process.env.TEST_MODE === "true") {
      return [];
    }
    try {
      const auth = createOAuth2Client(accessToken);
      const gmail = google.gmail({ version: "v1", auth });

      // Gmail query: messages received in last 24 hours
      const since = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
      const listResponse = await gmail.users.messages.list({
        userId: "me",
        maxResults: 50,
        q: `after:${since} in:inbox`,
      });

      const messages = listResponse.data.messages ?? [];

      const emails = await Promise.all(
        messages.map(async (msg) => {
          try {
            const detail = await gmail.users.messages.get({
              userId: "me",
              id: msg.id!,
              format: "full",
            });

            const headers = detail.data.payload?.headers ?? [];
            const subject = headers.find((h) => h.name === "Subject")?.value ?? "(No Subject)";
            const from = headers.find((h) => h.name === "From")?.value ?? "Unknown";
            const date = headers.find((h) => h.name === "Date")?.value ?? "";

            const rawBody = extractBody(detail.data.payload);
            const body = rawBody.trim().slice(0, 800);

            return { id: msg.id!, subject, from, date, body };
          } catch {
            return null;
          }
        })
      );

      return emails.filter(Boolean) as Array<{
        id: string;
        subject: string;
        from: string;
        date: string;
        body: string;
      }>;
    } catch (error) {
      logger.error("GoogleWorkspace", "fetchLast24hEmails failed", { error: String(error) }, trace);
      return [];
    }
  }, trace);
}

export async function fetchUpcomingEvents(
  accessToken: string,
  trace?: TraceContext
): Promise<
  Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    attendees: string[];
  }>
> {
  return logger.measure("GoogleWorkspace", "fetchUpcomingEvents", async () => {
    if (process.env.TEST_MODE === "true") {
      return [
        { id: "evt-1", title: "Seed Round Discussion", start: new Date().toISOString(), end: new Date().toISOString(), attendees: ["investor@example.com", "qa@oversight.ai"] }
      ];
    }
    try {
      const auth = createOAuth2Client(accessToken);
      const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      timeMax: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 15,
    });

    const events = response.data.items ?? [];

    return events.map((event) => ({
      id: event.id ?? "",
      title: event.summary ?? "(No Title)",
      start: event.start?.dateTime ?? event.start?.date ?? "",
      end: event.end?.dateTime ?? event.end?.date ?? "",
      attendees: (event.attendees ?? [])
        .map((a) => a.email ?? "")
        .filter(Boolean),
    }));
    } catch (error) {
      logger.error("GoogleWorkspace", "fetchUpcomingEvents failed", { error: String(error) }, trace);
      return [];
    }
  }, trace);
}
