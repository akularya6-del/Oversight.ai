import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { env } from "@/lib/env";
import { PendingFollowup, FollowupInsight, StagedAction } from "@/types/actions";
import { analyzeReply } from "@/lib/ai/followup-analyzer";
import { convert } from "html-to-text";

export const dynamic = "force-dynamic";

function createOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    let isCron = false;

    if (!session?.user?.accessToken) {
      const cronSecret = req.headers.get("x-cron-secret");
      if (cronSecret === env.CRON_SECRET) {
        isCron = true;
      } else {
        return NextResponse.json(
          { error: "Not authenticated. Please sign in with Google." },
          { status: 401 }
        );
      }
    }

    if (isCron) {
      // For MVP, we only process when a user hits the dashboard because we need their access token.
      // A full production app would store refresh tokens in a database to process cron jobs offline.
      return NextResponse.json({ message: "Cron triggered, but skipped due to missing offline refresh token in MVP." });
    }

    let kv;
    try {
      const kvModule = await import("@vercel/kv");
      kv = kvModule.kv;
    } catch (e) {
      console.warn("Vercel KV not available, returning empty insights");
      return NextResponse.json({ insights: [] });
    }

    const pendingIds = await kv.smembers("followups:pending");
    if (!pendingIds || pendingIds.length === 0) {
      return NextResponse.json({ insights: [] });
    }

    const authClient = createOAuth2Client(session!.user!.accessToken!);
    const gmail = google.gmail({ version: "v1", auth: authClient });

    const newInsights: FollowupInsight[] = [];

    for (const id of pendingIds) {
      const followup: PendingFollowup | null = await kv.get(`followup:${id}`);
      if (!followup) continue;

      // DEV ONLY — remove before deploy
      const isEligible = process.env.NODE_ENV === 'development' 
        ? true 
        : new Date() >= new Date(followup.checkAfter);

      if (!isEligible) continue;

      try {
        const threadRes = await gmail.users.threads.get({
          userId: "me",
          id: followup.threadId,
        });

        const messages = threadRes.data.messages || [];

        // If the thread has more than 1 message, a reply arrived.
        // We assume the original message is the first one (or we just grab the last message in thread as the reply).
        if (messages.length > 1) {
          const replyMessage = messages[messages.length - 1];
          const payload = replyMessage.payload;
          
          let replyFrom = "Unknown";
          const fromHeader = payload?.headers?.find((h) => h.name?.toLowerCase() === "from");
          if (fromHeader) replyFrom = fromHeader.value || "Unknown";

          let bodyData = "";
          if (payload?.parts) {
            const part = payload.parts.find((p) => p.mimeType === "text/plain" || p.mimeType === "text/html");
            if (part?.body?.data) bodyData = part.body.data;
          } else if (payload?.body?.data) {
            bodyData = payload.body.data;
          }

          let replyBody = "";
          if (bodyData) {
            const decoded = Buffer.from(bodyData, "base64url").toString("utf-8");
            replyBody = convert(decoded, { wordwrap: 130 });
          } else {
            replyBody = replyMessage.snippet || "";
          }

          const geminiResult = await analyzeReply(followup.originalSubject, replyBody);

          const insight: FollowupInsight = {
            id: crypto.randomUUID(),
            threadId: followup.threadId,
            originalSubject: followup.originalSubject,
            replyFrom,
            replySnippet: replyBody.slice(0, 300),
            detectedAt: new Date().toISOString(),
            proposedAction: geminiResult,
          };

          followup.status = "reply_found";
          await kv.set(`followup:${followup.id}`, JSON.stringify(followup));
          await kv.srem("followups:pending", followup.id);
          
          await kv.set(`insight:${insight.id}`, JSON.stringify(insight));
          await kv.sadd("insights:unread", insight.id);

          newInsights.push(insight);
        } else {
          // No reply yet, check again tomorrow
          followup.checkAfter = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          await kv.set(`followup:${followup.id}`, JSON.stringify(followup));
        }
      } catch (err) {
        console.error(`[followup] Error processing thread ${followup.threadId}:`, err);
      }
    }

    // Also fetch any existing unread insights from KV to show on dashboard
    const unreadInsightIds = await kv.smembers("insights:unread");
    const allInsights: FollowupInsight[] = [...newInsights];
    
    if (unreadInsightIds && unreadInsightIds.length > 0) {
      for (const id of unreadInsightIds) {
        // don't duplicate if we just added it
        if (!newInsights.find(i => i.id === id)) {
           const existing = await kv.get(`insight:${id}`);
           if (existing) allInsights.push(existing as FollowupInsight);
        }
      }
    }

    return NextResponse.json(
      { insights: allInsights },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[api/followup/check] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check follow-ups" },
      { status: 500 }
    );
  }
}
