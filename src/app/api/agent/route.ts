import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { fetchRecentEmails, fetchUpcomingEvents } from "@/lib/google/workspace";

import { ContactProfile } from "@/types/actions";
import { logger } from "@/lib/observability";

import { createOmegaPipeline } from "@/lib/ai/pipeline";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    let emails: any[];
    let events: any[];
    let contactProfilesMap = new Map<string, ContactProfile>();
    // Auth & Data fetching
    const session = await auth();
      if (!session?.user?.accessToken) {
        return new Response(JSON.stringify({ error: "Not authenticated." }), { status: 401 });
      }
      const accessToken = session.user.accessToken;
      [emails, events] = await Promise.all([
        fetchRecentEmails(accessToken, undefined), // Trace will be added inside the stream soon
        fetchUpcomingEvents(accessToken, undefined),
      ]);
      
      // Real emails only

      const uniqueSenders = Array.from(
        new Set(
          emails.map((e) => {
            const match = e.from.match(/<(.+)>/);
            return match ? match[1].trim() : e.from.trim();
          })
        )
      );

      const { getContactProfiles } = await import("@/lib/memory/contact-store");
      contactProfilesMap = await getContactProfiles(uniqueSenders);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        const trace = logger.createTrace();
        
        // Setup SSE listener for the Orchestrator
        const onAgentEvent = (node: string, status: string, message: string, meta?: any) => {
           sendEvent({
             type: 'event',
             event: {
               node,
               status,
               message,
               ...meta
             }
           });
        };

        try {
          const pipeline = createOmegaPipeline(onAgentEvent);
          
          let finalState;
          
          if (process.env.TEST_MODE === "true") {
            finalState = {
              payload: {
                VerifiedExecution: [
                  {
                    id: "mock-action-1",
                    type: "draft_email",
                    payload: {
                      to: "investor@example.com",
                      subject: "Follow up: Seed Round",
                      body: "Hi,\n\nJust following up on our seed round discussion.\n\nBest,\nOversight",
                    },
                    status: "pending_approval",
                  }
                ]
              }
            };
            onAgentEvent("MockPipeline", "completed", "Mock execution finished.");
          } else {
            finalState = await pipeline.execute({
              emails: JSON.stringify(emails),
              events: JSON.stringify(events),
              contactProfiles: JSON.stringify(Array.from(contactProfilesMap.entries()))
            }, trace);
          }
          
          // Execution output from VerifiedExecution (or whatever node finishes)
          // Since the legacy UI expects an array of `StagedAction` objects in `actions`,
          // and our new agent outputs structured data, we map it here.
          let stagedActions = finalState.payload.VerifiedExecution || [];
          if (!Array.isArray(stagedActions)) {
            // Just in case it's nested
            stagedActions = stagedActions.actions || [];
          }

          sendEvent({
            type: 'result',
            actions: stagedActions
          });
          controller.close();
        } catch (error: any) {
          logger.error("api/agent", "Pipeline failed", { error: error.message }, trace);
          sendEvent({
             type: 'event',
             event: {
               node: "Pipeline",
               status: "failed",
               message: `Pipeline crashed: ${error.message}`
             }
          });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
