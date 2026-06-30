import { BaseLLMAgent } from "../core/llm-agent";
import { SchemaType } from "@google/generative-ai";

export class PreBriefingAgent extends BaseLLMAgent<any, { briefings: Array<{ eventId: string; summary: string }> }> {
  name = "PreBriefingAgent";
  description = "Anticipates upcoming events and generates proactive context briefings.";

  protected buildSystemInstruction(): string {
    return `You are a Proactive Briefing Agent. Review the user's upcoming calendar events (next 2-4 hours). If an event is important (e.g., meeting with a VIP, pitch, interview), generate a proactive summary of what they need to know or prepare. Ignore trivial events like "Lunch" or "Focus Time".`;
  }

  protected buildUserPrompt(input: any): string {
    // Assuming input contains parsed events
    const payload = input.SanitizationAgent?.sanitizedPayload || JSON.stringify(input);
    return `Analyze these upcoming events and generate pre-briefings for important ones:\n\n${payload}`;
  }

  protected getResponseSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            briefings: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  eventId: { type: SchemaType.STRING },
                  summary: { type: SchemaType.STRING }
                }
              }
            }
          }
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING }
      },
      required: ["data", "confidence", "reasoning"]
    };
  }
}
