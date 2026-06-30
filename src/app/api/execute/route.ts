import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { env } from "@/lib/env";
import { ActionType, EmailPayload, EventPayload } from "@/types/actions";

function createOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export async function POST(req: NextRequest) {
  try {
    const { actionType, payload } = (await req.json()) as {
      actionType: ActionType;
      payload: EmailPayload | EventPayload;
    };

    const session = await auth();

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in with Google." },
        { status: 401 }
      );
    }

    const authClient = createOAuth2Client(session.user.accessToken);

    if (actionType === "draft_email") {
      const emailPayload = payload as EmailPayload;
      const gmail = google.gmail({ version: "v1", auth: authClient });

      // Construct RFC 2822 email string
      const emailString = [
        `To: ${emailPayload.to}`,
        `Subject: ${emailPayload.subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        ``,
        emailPayload.body,
      ].join("\n");

      // IMPORTANT: Must be base64url (not standard base64).
      // Gmail API rejects standard base64 with + and / characters.
      const encodedEmail = Buffer.from(emailString)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedEmail },
      });

      const threadId = response.data.threadId;
      const messageId = response.data.id;
      let followupId: string | undefined;

      if (threadId && messageId) {
        try {
          const { kv } = await import("@vercel/kv");
          const followup = {
            id: crypto.randomUUID(),
            threadId,
            messageId,
            originalSubject: emailPayload.subject,
            originalTo: emailPayload.to,
            sentAt: new Date().toISOString(),
            checkAfter: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "waiting",
          };
          await kv.set(`followup:${followup.id}`, JSON.stringify(followup));
          await kv.sadd("followups:pending", followup.id);
          followupId = followup.id;
        } catch (kvError) {
          console.warn("[api/execute] Failed to store followup in KV:", kvError);
        }
      }

      return NextResponse.json({
        success: true,
        messageId,
        ...(followupId && { followupId }),
      });
    }

    if (actionType === "schedule_event") {
      const eventPayload = payload as EventPayload;
      const calendar = google.calendar({ version: "v3", auth: authClient });

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: eventPayload.title,
          start: { dateTime: eventPayload.startDateTime, timeZone: "UTC" },
          end: { dateTime: eventPayload.endDateTime, timeZone: "UTC" },
          attendees: eventPayload.attendees.map((email) => ({ email })),
        },
      });

      return NextResponse.json(
        { success: true, eventId: response.data.id },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      { error: `Unknown action type: ${actionType}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("[api/execute] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution failed" },
      { status: 500 }
    );
  }
}
