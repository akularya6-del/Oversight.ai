import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";
import { StagedAction, ActionType, ContactProfile } from "@/types/actions";
import { env } from "@/lib/env";

export interface WorkspaceEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

export interface WorkspaceEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees: string[];
}

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "draft_email",
        description:
          "Draft an email to resolve a missed commitment or unanswered message.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            to: {
              type: SchemaType.STRING,
              description: "Recipient email address",
            },
            subject: {
              type: SchemaType.STRING,
              description: "Email subject line",
            },
            body: {
              type: SchemaType.STRING,
              description:
                "Full email body, written in a professional and apologetic tone where appropriate",
            },
            reasoning: {
              type: SchemaType.STRING,
              description:
                "A one-sentence explanation of why this email was flagged as a missed commitment (e.g., 'Client email from 5 days ago requesting the mockup has not been replied to.')",
            },
          },
          required: ["to", "subject", "body", "reasoning"],
        },
      },
      {
        name: "schedule_event",
        description:
          "Schedule a calendar event to fulfill a missed meeting or commitment.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: "Event title",
            },
            startDateTime: {
              type: SchemaType.STRING,
              description: "ISO 8601 start time",
            },
            endDateTime: {
              type: SchemaType.STRING,
              description: "ISO 8601 end time",
            },
            attendees: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Array of attendee email addresses",
            },
            reasoning: {
              type: SchemaType.STRING,
              description:
                "One-sentence explanation of why this event is being proposed",
            },
          },
          required: [
            "title",
            "startDateTime",
            "endDateTime",
            "attendees",
            "reasoning",
          ],
        },
      },
    ],
  },
];

export async function evaluateContext(
  emails: WorkspaceEmail[],
  events: WorkspaceEvent[],
  contactProfiles: Map<string, ContactProfile>
): Promise<StagedAction[]> {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are an autonomous productivity agent named Oversight.ai. Your only job is to analyze the provided emails and calendar events and identify missed commitments: emails that required a reply but received none, deadlines that have passed without evidence of completion, and follow-ups that were promised but never sent.

When a missed commitment involves a VIP-tier contact, treat it with higher urgency. Reflect this in the reasoning field by explicitly naming the contact and their relationship context (e.g., "Sarah Chen — your primary ClientCo stakeholder — has been waiting 5 days for the mockup you promised.").

For each missed commitment you identify, you MUST call the appropriate tool: draft_email or schedule_event. You must NOT write any conversational text. You must NOT explain your reasoning in prose. Every insight must be expressed as a tool call. If you find no missed commitments, call no tools.

Today's date is ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}.`,
  });

  const contactContextBlock = emails
    .map((email) => {
      const senderEmail = email.from.match(/<(.+)>/)?.[1] ?? email.from;
      const profile = contactProfiles.get(senderEmail.toLowerCase().trim());
      if (!profile) return null;
      return `Contact: ${profile.name} (${profile.email})\nOrganization: ${profile.organization}\nRelationship: ${profile.relationshipSummary}\nPriority Tier: ${profile.tier.toUpperCase()}\nUrgency Level: ${profile.typicalResponseUrgency}\nKey Topics: ${profile.keyTopics.join(", ")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const userMessage = `Here is the user's current workspace context. Analyze it and call the appropriate tools for each missed commitment.

KNOWN CONTACT PROFILES (use this to assess urgency and priority):
${contactContextBlock || "No profiles available for these senders."}

RECENT EMAILS (last 20):
${JSON.stringify(emails, null, 2)}

UPCOMING/RECENT CALENDAR EVENTS:
${JSON.stringify(events, null, 2)}`;

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    tools,
  });

  const functionCalls = response.response.functionCalls();

  if (!functionCalls || functionCalls.length === 0) {
    return [];
  }

  return functionCalls.map((call) => {
    const { reasoning, ...payloadArgs } = call.args as {
      reasoning: string;
      to?: string;
      subject?: string;
      body?: string;
      title?: string;
      startDateTime?: string;
      endDateTime?: string;
      attendees?: string[];
    };
    
    // Enrich with contact profile and priority
    let priority: "high" | "normal" = "normal";
    let senderProfile: ContactProfile | undefined;
    
    const relevantEmails = call.name === "draft_email" ? [payloadArgs.to] : (payloadArgs.attendees || []);
    
    for (const email of relevantEmails) {
      if (!email) continue;
      const profile = contactProfiles.get(email.toLowerCase().trim());
      if (profile) {
        if (!senderProfile) senderProfile = profile;
        if (profile.tier === "vip") priority = "high";
      }
    }

    const commonProps = {
      id: crypto.randomUUID(),
      reasoning: reasoning ?? "Flagged as a potential missed commitment.",
      status: "pending_approval" as const,
      priority,
      senderProfile,
    };

    if (call.name === "draft_email") {
      return {
        ...commonProps,
        type: "draft_email",
        payload: {
          to: payloadArgs.to!,
          subject: payloadArgs.subject!,
          body: payloadArgs.body!,
        },
      } satisfies StagedAction;
    } else {
      return {
        ...commonProps,
        type: "schedule_event",
        payload: {
          title: payloadArgs.title!,
          startDateTime: payloadArgs.startDateTime!,
          endDateTime: payloadArgs.endDateTime!,
          attendees: payloadArgs.attendees || [],
        },
      } satisfies StagedAction;
    }
  });
}
