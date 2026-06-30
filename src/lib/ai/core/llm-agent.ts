import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { BaseAgent, AgentContext, AgentResult } from "./agent";
import { env } from "@/lib/env";
import { logger } from "@/lib/observability";

export abstract class BaseLLMAgent<TInput, TOutput> extends BaseAgent<TInput, TOutput> {
  protected genAI: GoogleGenerativeAI;
  protected modelName = "gemini-2.5-flash";

  constructor() {
    super();
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  }

  protected abstract buildSystemInstruction(): string;
  protected abstract buildUserPrompt(input: TInput): string;
  protected abstract getResponseSchema(): any; // Structured output schema

  protected async _execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: this.buildSystemInstruction(),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this.getResponseSchema(),
      }
    });

    const userPrompt = this.buildUserPrompt(input);
    logger.debug(this.name, "Sending prompt to Gemini", { length: userPrompt.length }, context.trace);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }]
    });

    const usage = result.response.usageMetadata;
    const responseText = result.response.text();
    
    let parsed: TOutput;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse structured output from ${this.name}: ${responseText}`);
    }

    // Assuming the schema always returns an object with a `confidence` (0-1) and `reasoning` string,
    // plus the actual `data` payload. If the schema doesn't match this, we might need to adjust.
    // For standard compliance across agents, let's enforce that the schema returns { data: TOutput, confidence: number, reasoning: string }
    
    const parsedData = parsed as any;
    
    return {
      output: parsedData.data !== undefined ? parsedData.data : parsedData,
      confidence: parsedData.confidence ?? 0.9,
      reasoning: parsedData.reasoning ?? "Executed successfully",
      usage: usage ? {
        promptTokens: usage.promptTokenCount,
        completionTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount
      } : undefined,
      durationMs: 0,
      retries: 0
    };
  }
}
