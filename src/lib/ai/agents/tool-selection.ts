import { SchemaType } from "@google/generative-ai";
import { BaseLLMAgent } from "../core/llm-agent";
import { PROMPTS } from "../prompts";

export interface ToolSelectionInput {
  commitments: string;
}

export interface ToolDecision {
  commitment: string;
  tool: string;
}

export interface ToolSelectionOutput {
  decisions: ToolDecision[];
}

export class ToolSelectionAgent extends BaseLLMAgent<ToolSelectionInput, ToolSelectionOutput> {
  name = "ToolSelectionAgent";
  description = PROMPTS.TOOL_SELECTION.description;

  protected buildSystemInstruction(): string {
    return PROMPTS.TOOL_SELECTION.systemPrompt;
  }

  protected buildUserPrompt(input: ToolSelectionInput): string {
    return PROMPTS.TOOL_SELECTION.userPromptTemplate(input);
  }

  protected getResponseSchema(): any {
    return {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.OBJECT,
          properties: {
            decisions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  commitment: { type: SchemaType.STRING },
                  tool: { type: SchemaType.STRING },
                },
                required: ["commitment", "tool"],
              },
            },
          },
          required: ["decisions"],
        },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["data", "confidence", "reasoning"],
    };
  }
}
