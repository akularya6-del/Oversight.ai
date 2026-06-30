import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface ReasoningInput {
  context: string;
}

export interface ReasoningOutput {
  missedCommitments: string[];
}

export class ReasoningAgent extends BaseLLMAgent<ReasoningInput, ReasoningOutput> {
  name = "ReasoningAgent";
  description = PROMPTS.REASONING.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.REASONING.systemPrompt;
  }

  protected buildUserPrompt(input: ReasoningInput): string {
    return PROMPTS.REASONING.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            missedCommitments: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ["missedCommitments"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
