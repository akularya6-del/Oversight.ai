import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface PlannerInput {
  emails: string;
  events: string;
}

export interface PlannerOutput {
  steps: string[];
}

export class PlannerAgent extends BaseLLMAgent<PlannerInput, PlannerOutput> {
  name = "PlannerAgent";
  description = PROMPTS.PLANNER.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.PLANNER.systemPrompt;
  }

  protected buildUserPrompt(input: PlannerInput): string {
    return PROMPTS.PLANNER.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            steps: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
              },
            },
          },
          required: ["steps"],
        },
        confidence: {
          type: SchemaType.NUMBER,
        },
        reasoning: {
          type: SchemaType.STRING,
        },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
