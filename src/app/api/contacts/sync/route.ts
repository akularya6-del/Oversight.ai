import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTopSenders, fetchEmailHistoryWithContact } from "@/lib/google/contact-history";
import { buildContactProfile } from "@/lib/ai/contact-profiler";
import { ContactProfile } from "@/types/actions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in with Google." },
        { status: 401 }
      );
    }

    // MOCK FOR QA E2E SUITE
    if (process.env.TEST_MODE === "true") {
      const mockContacts = [
        {
          email: "investor@example.com",
          name: "Decision Maker",
          recentContext: "Follow up on seed round",
          suggestedAction: {
            type: "draft",
            description: "Draft follow up email with pitch deck",
            confidenceScore: 0.95,
          },
          profileBuiltAt: new Date().toISOString(),
        },
      ];
      // Cache the mock contacts for the dashboard
      const kvModule = await import("@vercel/kv");
      const kv = kvModule.kv;
      const cacheKey = `contacts:${session.user.email}`;
      await kv.set(cacheKey, mockContacts, { ex: 3600 });
      return NextResponse.json({ synced: mockContacts.length, profiles: mockContacts });
    }

    const accessToken = session.user.accessToken;
    let kv: any;
    try {
      const kvModule = await import("@vercel/kv");
      kv = kvModule.kv;
    } catch (e) {
      console.warn("[api/contacts/sync] KV not available, returning empty profiles");
      return NextResponse.json({ synced: 0, profiles: [] });
    }

    // Get the top 15 most frequent senders
    const topSenders = await getTopSenders(accessToken, 15);
    const newProfiles: ContactProfile[] = [];
    const stalenessThresholdMs = 48 * 60 * 60 * 1000; // 48 hours

    // Concurrent evaluation of all senders using Promise.allSettled
    await Promise.allSettled(
      topSenders.map(async (sender) => {
        const cacheKey = `contact:${sender.email.toLowerCase()}`;
        const existingProfile: ContactProfile | null = await kv.get(cacheKey);

        if (existingProfile) {
          const builtAt = new Date(existingProfile.profileBuiltAt).getTime();
          const isStale = Date.now() - builtAt > stalenessThresholdMs;
          if (!isStale) {
            newProfiles.push(existingProfile);
            return;
          }
        }

        // Needs building/refreshing
        const history = await fetchEmailHistoryWithContact(accessToken, sender.email, 10);
        const profile = await buildContactProfile(sender.email, sender.name, history);

        await kv.set(cacheKey, JSON.stringify(profile));
        await kv.sadd("contacts:indexed", sender.email.toLowerCase());
        newProfiles.push(profile);
      })
    );

    return NextResponse.json(
      {
        success: true,
        synced: newProfiles.length,
        profiles: newProfiles,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[api/contacts/sync] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
