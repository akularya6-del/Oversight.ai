export type TraceContext = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
};

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  metadata?: Record<string, unknown>;
  trace?: TraceContext;
  durationMs?: number;
}

class Observability {
  private static generateId() {
    return crypto.randomUUID();
  }

  public createTrace(): TraceContext {
    return {
      traceId: Observability.generateId(),
      spanId: Observability.generateId(),
    };
  }

  public createSpan(parent: TraceContext): TraceContext {
    return {
      traceId: parent.traceId,
      spanId: Observability.generateId(),
      parentSpanId: parent.spanId,
    };
  }

  private log(entry: Omit<LogEntry, "timestamp">) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    
    // In production, this would ship to Cloud Logging / Datadog
    // For Hackathon / Vibe2Ship, we log cleanly to stdout 
    // and also store it in a global array for the Mission Control UI.
    
    // Formatting for console
    const color = {
      debug: "\x1b[34m", // Blue
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
    }[entry.level];
    const reset = "\x1b[0m";

    console.log(
      `${color}[${entry.level.toUpperCase()}]${reset} [${entry.component}] ${entry.message}`,
      entry.metadata ? JSON.stringify(entry.metadata) : "",
      entry.durationMs ? `(${entry.durationMs}ms)` : ""
    );

    // Emit event for UI if on server
    if (typeof process !== "undefined" && (global as any).missionControlEmitter) {
       (global as any).missionControlEmitter.emit("log", logEntry);
    }
  }

  public debug(component: string, message: string, metadata?: Record<string, unknown>, trace?: TraceContext) {
    this.log({ level: "debug", component, message, metadata, trace });
  }

  public info(component: string, message: string, metadata?: Record<string, unknown>, trace?: TraceContext) {
    this.log({ level: "info", component, message, metadata, trace });
  }

  public warn(component: string, message: string, metadata?: Record<string, unknown>, trace?: TraceContext) {
    this.log({ level: "warn", component, message, metadata, trace });
  }

  public error(component: string, message: string, metadata?: Record<string, unknown>, trace?: TraceContext) {
    this.log({ level: "error", component, message, metadata, trace });
  }

  public async measure<T>(
    component: string,
    operationName: string,
    fn: () => Promise<T>,
    trace?: TraceContext
  ): Promise<T> {
    const start = performance.now();
    try {
      this.debug(component, `Starting ${operationName}`, undefined, trace);
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.info(component, `Completed ${operationName}`, { success: true }, { ...(trace ?? {}), durationMs } as TraceContext & { durationMs: number });
      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      this.error(component, `Failed ${operationName}`, { error: String(error) }, { ...(trace ?? {}), durationMs } as TraceContext & { durationMs: number });
      throw error;
    }
  }
}

export const logger = new Observability();
