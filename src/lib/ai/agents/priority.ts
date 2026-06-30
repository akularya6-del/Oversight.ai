import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface PriorityInput {
  commitments: string;
}

export interface PrioritizedCommitment {
  commitment: string;
  priority: string;
}

export interface PriorityOutput {
  prioritizedCommitments: PrioritizedCommitment[];
}

export class PriorityAgent extends BaseLLMAgent<PriorityInput, PriorityOutput> {
  name = "PriorityAgent";
  description = PROMPTS.PRIORITIZATION.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.PRIORITIZATION.systemPrompt;
  }

  protected buildUserPrompt(input: PriorityInput): string {
    return PROMPTS.PRIORITIZATION.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            prioritizedCommitments: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  commitment: { type: SchemaType.STRING },
                  priority: { type: SchemaType.STRING },
                },
                required: ["commitment", "priority"],
              },
            },
          },
          required: ["prioritizedCommitments"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
