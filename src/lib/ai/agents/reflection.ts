import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface ReflectionInput {
  trace: string;
}

export interface ReflectionOutput {
  score: number;
  retryRecommended: boolean;
}

export class ReflectionAgent extends BaseLLMAgent<ReflectionInput, ReflectionOutput> {
  name = "ReflectionAgent";
  description = PROMPTS.REFLECTION.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.REFLECTION.systemPrompt;
  }

  protected buildUserPrompt(input: ReflectionInput): string {
    return PROMPTS.REFLECTION.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            retryRecommended: { type: SchemaType.BOOLEAN },
          },
          required: ["score", "retryRecommended"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
