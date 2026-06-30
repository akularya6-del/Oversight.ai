import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface ExecutionInput {
  decisions: string;
}

export interface ExecutionPayload {
  tool: string;
  payload: string;
}

export interface ExecutionOutput {
  payloads: ExecutionPayload[];
}

export class ExecutionAgent extends BaseLLMAgent<ExecutionInput, ExecutionOutput> {
  name = "ExecutionAgent";
  description = PROMPTS.EXECUTION.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.EXECUTION.systemPrompt;
  }

  protected buildUserPrompt(input: ExecutionInput): string {
    return PROMPTS.EXECUTION.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            payloads: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  tool: { type: SchemaType.STRING },
                  payload: { type: SchemaType.STRING },
                },
                required: ["tool", "payload"],
              },
            },
          },
          required: ["payloads"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
