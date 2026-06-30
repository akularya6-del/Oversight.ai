import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface MemoryInput {
  entities: string;
  history: string;
}

export interface MemoryOutput {
  hydratedEntities: string[];
}

export class MemoryAgent extends BaseLLMAgent<MemoryInput, MemoryOutput> {
  name = "MemoryAgent";
  description = PROMPTS.MEMORY.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.MEMORY.systemPrompt;
  }

  protected buildUserPrompt(input: MemoryInput): string {
    return PROMPTS.MEMORY.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            hydratedEntities: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ["hydratedEntities"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
