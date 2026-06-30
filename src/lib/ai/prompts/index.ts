export type PromptVersion = "v1.0.0" | "v1.1.0";

export interface PromptDefinition {
  version: PromptVersion;
  id: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: (args: Record<string, any>) => string;
}

export const PROMPTS = {
  PLANNER: {
    version: "v1.0.0",
    id: "prompt-planner-01",
    description: "Evaluates the initial input to determine the required analysis steps.",
    systemPrompt: `You are the Planner Agent. Your goal is to analyze the raw incoming payload (emails, events) and determine if there is actionable work. Output a structured plan.`,
    userPromptTemplate: (args: { emails: string; events: string }) => 
      `Analyze the following payload and output a plan.\n\nEmails:\n${args.emails}\n\nEvents:\n${args.events}`
  },
  CONTEXT: {
    version: "v1.0.0",
    id: "prompt-context-01",
    description: "Filters noise and extracts entities from raw emails.",
    systemPrompt: `You are the Context Extraction Agent. Your goal is to read raw communications and extract key entities, dates, and implied commitments. Filter out noise and irrelevant chatter.`,
    userPromptTemplate: (args: { payload: string }) => 
      `Extract context from the following payload:\n\n${args.payload}`
  },
  MEMORY: {
    version: "v1.0.0",
    id: "prompt-memory-01",
    description: "Hydrates extracted entities with historical memory.",
    systemPrompt: `You are the Memory Agent. You cross-reference current entities with historical relationships to provide deeper context on priorities and past interactions.`,
    userPromptTemplate: (args: { entities: string; history: string }) => 
      `Hydrate these entities with the provided history:\nEntities: ${args.entities}\nHistory: ${args.history}`
  },
  REASONING: {
    version: "v1.0.0",
    id: "prompt-reasoning-01",
    description: "Deduces true missed commitments based on context and memory.",
    systemPrompt: `You are the Reasoning Agent. You analyze the hydrated context to definitively identify if a commitment was missed (e.g., an email requiring a reply that wasn't answered).`,
    userPromptTemplate: (args: { context: string }) => 
      `Analyze the following context for missed commitments:\n\n${args.context}`
  },
  PRIORITIZATION: {
    version: "v1.0.0",
    id: "prompt-priority-01",
    description: "Assigns urgency and priority tiers.",
    systemPrompt: `You are the Prioritization Agent. Assign a strict priority (CRITICAL, HIGH, MEDIUM, LOW) to the identified commitments based on the sender's VIP status and the urgency of the text.`,
    userPromptTemplate: (args: { commitments: string }) => 
      `Prioritize the following commitments:\n\n${args.commitments}`
  },
  TOOL_SELECTION: {
    version: "v1.0.0",
    id: "prompt-tool-selection-01",
    description: "Chooses between drafting an email, scheduling an event, or ignoring.",
    systemPrompt: `You are the Tool Selection Agent. Based on the prioritized commitments, decide which tool is required to resolve each issue.`,
    userPromptTemplate: (args: { commitments: string }) => 
      `Select appropriate tools for the following:\n\n${args.commitments}`
  },
  EXECUTION: {
    version: "v1.0.0",
    id: "prompt-execution-01",
    description: "Generates the actual payload (email draft, calendar event).",
    systemPrompt: `You are the Execution Agent. Generate the precise payloads (like an email body or calendar event title) to fulfill the selected tool.`,
    userPromptTemplate: (args: { decisions: string }) => 
      `Generate payloads for the following decisions:\n\n${args.decisions}`
  },
  VERIFICATION: {
    version: "v1.0.0",
    id: "prompt-verification-01",
    description: "Cross-checks the execution payload against original constraints to prevent hallucinations.",
    systemPrompt: `You are the Verification Agent. Cross-check the proposed execution payloads against the original emails. Ensure no hallucinations, incorrect dates, or inappropriate tones. Output PASSED or FAILED with reasons.`,
    userPromptTemplate: (args: { original: string; proposed: string }) => 
      `Verify the proposed payload against the original context:\nOriginal: ${args.original}\nProposed: ${args.proposed}`
  },
  REFLECTION: {
    version: "v1.0.0",
    id: "prompt-reflection-01",
    description: "Evaluates overall decision confidence.",
    systemPrompt: `You are the Reflection Agent. Evaluate the entire pipeline's work. Assign a confidence score from 0.0 to 1.0. If confidence is below 0.8, recommend a retry.`,
    userPromptTemplate: (args: { trace: string }) => 
      `Reflect on this trace and assign a confidence score:\n\n${args.trace}`
  },
} as const;
