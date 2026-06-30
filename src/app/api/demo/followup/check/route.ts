import { NextResponse } from "next/server";

export async function GET() {
  await new Promise(r => setTimeout(r, 1000));

  return NextResponse.json({
    insights: [
      {
        id: "demo-insight-1",
        threadId: "demo-thread-1",
        originalSubject: "Q2 Marketing Strategy",
        replyFrom: "Director of Marketing",
        replySnippet: "Could you review the proposed budget by Thursday?",
        detectedAt: new Date().toISOString(),
        proposedAction: {
          id: "demo-insight-action-1",
          type: "draft_email",
          payload: {
            to: "marketing@oversight.example.com",
            subject: "Re: Q2 Marketing Strategy",
            body: "Hi team,\n\nThe proposed budget looks solid. Approved from my side. Let's proceed.\n\nBest,\nAlex"
          },
          status: "staged",
          priority: "high",
          reasoning: "You missed an explicit request for review due tomorrow.",
          senderProfile: {
            id: "marketing-director",
            name: "Emily Chen",
            email: "marketing@oversight.example.com",
            tier: "standard",
            relationshipSummary: "Internal marketing lead."
          }
        }
      }
    ]
  });
}
