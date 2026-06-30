import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface VerificationInput {
  original: string;
  proposed: string;
}

export interface VerificationOutput {
  status: string;
  issues: string[];
}

export class VerificationAgent extends BaseLLMAgent<VerificationInput, VerificationOutput> {
  name = "VerificationAgent";
  description = PROMPTS.VERIFICATION.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.VERIFICATION.systemPrompt;
  }

  protected buildUserPrompt(input: VerificationInput): string {
    return PROMPTS.VERIFICATION.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            status: { type: SchemaType.STRING },
            issues: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ["status", "issues"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
