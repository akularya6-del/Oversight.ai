import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface ContextInput {
  payload: string;
}

export interface ContextOutput {
  entities: string[];
  dates: string[];
  commitments: string[];
}

export class ContextAgent extends BaseLLMAgent<ContextInput, ContextOutput> {
  name = "ContextAgent";
  description = PROMPTS.CONTEXT.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.CONTEXT.systemPrompt;
  }

  protected buildUserPrompt(input: ContextInput): string {
    return PROMPTS.CONTEXT.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            entities: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            dates: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            commitments: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ["entities", "dates", "commitments"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
