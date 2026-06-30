import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";
import { StagedAction, EventPayload } from "@/types/actions";
import { env } from "@/lib/env";

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "extract_meeting_from_reply",
        description:
          "Called when a reply email contains a proposed meeting time, scheduling request, or confirmed appointment that should be added to the calendar.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: "Event title inferred from context",
            },
            startDateTime: {
              type: SchemaType.STRING,
              description: "ISO 8601 start date and time extracted from the reply",
            },
            endDateTime: {
              type: SchemaType.STRING,
              description: "ISO 8601 end date and time, infer 1 hour duration if not specified",
            },
            attendees: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Email addresses mentioned in the reply",
            },
            reasoning: {
              type: SchemaType.STRING,
              description: "One sentence explaining what scheduling info was found",
            },
          },
          required: ["title", "startDateTime", "endDateTime", "attendees", "reasoning"],
        },
      },
    ],
  },
];

export async function analyzeReply(
  originalSubject: string,
  replyBody: string
): Promise<StagedAction | null> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are analyzing an email reply to detect whether it contains scheduling information: a proposed meeting time, a confirmed date, or a calendar commitment. If and ONLY IF you detect a specific time, date, or scheduling request, call the extract_meeting_from_reply tool. If the reply is a general acknowledgment with no scheduling content, call no tools and return nothing. Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
    tools,
  });

  const prompt = `Original email subject: "${originalSubject}"\nReply content:\n\n${replyBody}\n\nDoes this reply contain scheduling information? If yes, call the tool.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const functionCall = response.functionCalls()?.[0];

  if (!functionCall) return null;

  if (functionCall.name === "extract_meeting_from_reply") {
    const args = functionCall.args as {
      title: string;
      startDateTime: string;
      endDateTime: string;
      attendees: string[];
      reasoning: string;
    };
    return {
      id: crypto.randomUUID(),
      type: "schedule_event",
      reasoning: args.reasoning,
      payload: {
        title: args.title,
        startDateTime: args.startDateTime,
        endDateTime: args.endDateTime,
        attendees: args.attendees,
      } as EventPayload,
      status: "pending_approval",
    };
  }

  return null;
}
