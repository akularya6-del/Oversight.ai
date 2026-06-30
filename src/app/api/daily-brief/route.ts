import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchLast24hEmails } from "@/lib/google/workspace";
import { generateDailyBrief, DEMO_BRIEF } from "@/lib/ai/daily-brief";

const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

// In-memory cache keyed by user session (fallback if no Redis)
const memCache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached(key: string): unknown | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  memCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get("demo") === "true";
  const refresh = searchParams.get("refresh") === "true";

  if (demo) {
    return NextResponse.json({ ...DEMO_BRIEF, generatedAt: new Date().toISOString() });
  }

  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.user.accessToken as string | undefined;
  const userName = session.user.name ?? "there";
  const userKey = `daily-brief:${session.user.email}`;

  // Return cached result unless forced refresh
  if (!refresh) {
    const cached = getCached(userKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }
  }

  // Stream progress via SSE is handled by the client — we return JSON directly here
  if (!accessToken) {
    return NextResponse.json(
      { ...DEMO_BRIEF, generatedAt: new Date().toISOString(), fallback: true },
      { status: 200 }
    );
  }

  try {
    const emails = await fetchLast24hEmails(accessToken);
    const brief = await generateDailyBrief(emails, userName);

    setCache(userKey, brief);
    return NextResponse.json(brief);
  } catch (err) {
    console.error("[daily-brief] Error generating brief:", err);
    return NextResponse.json(
      { ...DEMO_BRIEF, generatedAt: new Date().toISOString(), fallback: true },
      { status: 200 }
    );
  }
}
