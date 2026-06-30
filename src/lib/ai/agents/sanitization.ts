import { BaseLLMAgent } from "../core/llm-agent";
import { SchemaType } from "@google/generative-ai";

export class SanitizationAgent extends BaseLLMAgent<any, { sanitizedPayload: string }> {
  name = "SanitizationAgent";
  description = "Masks PII (emails, phones, SSNs) from raw payload before downstream processing.";

  protected buildSystemInstruction(): string {
    return `You are a strict PII Sanitization Agent. Your ONLY job is to take raw text and replace sensitive information (Phone numbers, SSNs, Credit Cards, precise home addresses, private access codes) with generic tags like [PHONE_REDACTED], [ADDRESS_REDACTED], [CODE_REDACTED]. DO NOT alter the meaning, tone, or formatting of the text. Do not redact names or email addresses, as they are required for context routing.`;
  }

  protected buildUserPrompt(input: any): string {
    return `Sanitize the following payload:\n\n${JSON.stringify(input, null, 2)}`;
  }

  protected getResponseSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            sanitizedPayload: { type: SchemaType.STRING }
          }
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING }
      },
      required: ["data", "confidence", "reasoning"]
    };
  }
}
