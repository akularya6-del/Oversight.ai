import { logger, TraceContext } from "@/lib/observability";

export interface AgentContext {
  trace: TraceContext;
  [key: string]: unknown;
}

export interface AgentResult<T> {
  output: T;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
  retries: number;
  metadata?: Record<string, unknown>;
}

export interface Agent<TInput, TOutput> {
  name: string;
  description: string;
  
  execute(
    input: TInput, 
    context: AgentContext
  ): Promise<AgentResult<TOutput>>;
}

export abstract class BaseAgent<TInput, TOutput> implements Agent<TInput, TOutput> {
  abstract name: string;
  abstract description: string;
  protected maxRetries = 2;

  protected abstract _execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>>;

  public async execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>> {
    let attempt = 0;
    const startTime = performance.now();
    
    while (attempt <= this.maxRetries) {
      try {
        logger.info(this.name, `Starting execution (Attempt ${attempt + 1})`, { input }, context.trace);
        
        const result = await this._execute(input, context);
        
        const durationMs = Math.round(performance.now() - startTime);
        result.durationMs = durationMs;
        result.retries = attempt;

        logger.info(this.name, `Completed successfully`, { 
          confidence: result.confidence,
          durationMs,
          retries: attempt
        }, context.trace);

        return result;
      } catch (error) {
        attempt++;
        logger.warn(this.name, `Execution failed (Attempt ${attempt})`, { error: String(error) }, context.trace);
        
        if (attempt > this.maxRetries) {
          logger.error(this.name, `Max retries exceeded`, { error: String(error) }, context.trace);
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw new Error(`${this.name} failed after ${this.maxRetries} retries`);
  }
}
