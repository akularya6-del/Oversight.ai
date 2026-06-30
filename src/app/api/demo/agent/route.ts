import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Simulate network delay
      await new Promise(r => setTimeout(r, 600));

      sendData({
        type: 'event',
        event: {
          type: 'agent_start',
          agent: 'PlannerAgent',
          message: 'Planning execution strategy',
        }
      });
      await new Promise(r => setTimeout(r, 1200));

      sendData({
        type: 'event',
        event: {
          type: 'agent_start',
          agent: 'MemoryAgent',
          message: 'Retrieving context from memory',
        }
      });
      await new Promise(r => setTimeout(r, 1500));

      sendData({
        type: 'event',
        event: {
          type: 'agent_start',
          agent: 'VerificationAgent',
          message: 'Verifying proposed actions',
        }
      });
      await new Promise(r => setTimeout(r, 1000));

      sendData({
        type: 'result',
        actions: [
          {
            id: 'demo-1',
            type: 'schedule_event',
            payload: {
              summary: 'Q3 Product Roadmap Review',
              startTime: new Date(Date.now() + 86400000).toISOString(),
              endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
              attendees: ['investor@sequoia.example.com', 'ceo@oversight.example.com']
            },
            status: 'staged',
            priority: 'high',
            reasoning: 'Investor requested an update on Q3 progress. This avoids a scheduling conflict with your board meeting.',
            senderProfile: {
              id: 'investor-seq',
              email: 'investor@sequoia.example.com',
              name: 'Roelof Botha',
              tier: 'vip',
              relationshipSummary: 'Lead investor from Series A.'
            }
          },
          {
            id: 'demo-2',
            type: 'draft_email',
            payload: {
              to: 'enterprise@acme.example.com',
              subject: 'Re: Enterprise Contract Final Approval',
              body: 'Hi Sarah,\n\nI have reviewed the final redlines from your legal team. We are good to go on our end. Please send over the DocuSign when ready.\n\nBest,\nAlex'
            },
            status: 'staged',
            priority: 'high',
            reasoning: 'Acme Corp is a key account and sent the final contract redlines yesterday. Approving this will close the $120k ARR deal.',
            senderProfile: {
              id: 'acme-corp',
              email: 'enterprise@acme.example.com',
              name: 'Sarah Jenkins',
              tier: 'vip',
              relationshipSummary: 'Procurement head at Acme Corp.'
            }
          },
          {
            id: 'demo-3',
            type: 'draft_email',
            payload: {
              to: 'billing@awsservices.example.com',
              subject: 'Re: Overdue Invoice #99238',
              body: 'Hi Billing Team,\n\nApologies for the delay. This invoice has been forwarded to our finance department and will be paid by Friday.\n\nThanks,\nAlex'
            },
            status: 'staged',
            priority: 'normal',
            reasoning: 'Invoice #99238 is 3 days overdue. Finance needs to be notified to avoid service interruption.',
            senderProfile: {
              id: 'aws-billing',
              email: 'billing@awsservices.example.com',
              name: 'AWS Billing',
              tier: 'standard',
              relationshipSummary: 'Cloud infrastructure provider.'
            }
          },
          {
            id: 'demo-4',
            type: 'schedule_event',
            payload: {
              summary: 'Flight: SFO to JFK (Delta DL492)',
              startTime: new Date(Date.now() + 3 * 86400000).toISOString(),
              endTime: new Date(Date.now() + 3 * 86400000 + 18000000).toISOString(),
              attendees: []
            },
            status: 'staged',
            priority: 'normal',
            reasoning: 'Detected a travel itinerary in your inbox that wasn\'t on your calendar.',
            senderProfile: {
              id: 'delta-airlines',
              email: 'receipts@delta.example.com',
              name: 'Delta Airlines',
              tier: 'standard',
              relationshipSummary: 'Preferred airline.'
            }
          },
          {
            id: 'demo-5',
            type: 'draft_email',
            payload: {
              to: 'team@oversight.example.com',
              subject: 'Re: Design Review Sync',
              body: 'Team,\n\nI have a conflict with the 2pm slot. Can we move the design review to 4pm instead?\n\nThanks,\nAlex'
            },
            status: 'staged',
            priority: 'normal',
            reasoning: 'The proposed design review conflicts with your VIP investor call.',
            senderProfile: {
              id: 'team-design',
              email: 'team@oversight.example.com',
              name: 'Design Team',
              tier: 'standard',
              relationshipSummary: 'Internal product design team.'
            }
          }
        ]
      });

      controller.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
