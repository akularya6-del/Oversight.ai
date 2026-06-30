import { Orchestrator, DagNode } from "./core/orchestrator";
import { 
  PlannerAgent, 
  ContextAgent, 
  MemoryAgent, 
  ReasoningAgent, 
  PriorityAgent, 
  ToolSelectionAgent, 
  ExecutionAgent, 
  VerificationAgent, 
  ReflectionAgent,
  SanitizationAgent,
  PreBriefingAgent
} from "./agents";

export type AgentEventHandler = (node: string, status: string, message: string, meta?: any) => void;

export function createOmegaPipeline(onEvent: AgentEventHandler) {
  const orchestrator = new Orchestrator(onEvent);

  const planner = new PlannerAgent();
  const contextExt = new ContextAgent();
  const memory = new MemoryAgent();
  const reasoning = new ReasoningAgent();
  const priority = new PriorityAgent();
  const toolSelection = new ToolSelectionAgent();
  const reflection = new ReflectionAgent();
  
  // Composite node for Verified Execution to keep DAG strictly acyclic globally
  // while supporting localized retries.
  const execution = new ExecutionAgent();
  const verification = new VerificationAgent();
  const sanitization = new SanitizationAgent();
  const preBriefing = new PreBriefingAgent();

  const wrapNode = (agent: any, deps: string[], condition?: any): DagNode => ({
    name: agent.constructor.name.replace('Agent', ''),
    agent,
    dependencies: deps,
    condition
  });

  // Level 1: Sanitization (Runs first, unblocks the rest)
  orchestrator.registerNode(wrapNode(sanitization, []));

  // Level 2: Parallel Context & Planning (Wait for Sanitization)
  orchestrator.registerNode(wrapNode(planner, ["Sanitization"]));
  orchestrator.registerNode(wrapNode(contextExt, ["Sanitization"]));
  orchestrator.registerNode(wrapNode(preBriefing, ["Sanitization"]));

  // Level 3
  orchestrator.registerNode(wrapNode(memory, ["Context", "PreBriefing"]));

  // Level 4
  orchestrator.registerNode(wrapNode(reasoning, ["Planner", "Memory"]));

  // Level 5
  orchestrator.registerNode(wrapNode(priority, ["Reasoning"], (state: any) => {
    const data = state.payload.Reasoning;
    return data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
  }));

  // Level 5
  orchestrator.registerNode(wrapNode(toolSelection, ["Priority"]));

  // Level 6 - Composite Verified Execution Node
  const verifiedExecutionAgent = {
    name: "VerifiedExecution",
    description: "Executes payloads and self-verifies, looping if necessary.",
    execute: async (payload: any, context: any) => {
      let attempts = 0;
      const maxAttempts = 3;
      let lastExecutionOutput = null;

      while (attempts < maxAttempts) {
        attempts++;
        const execResult = await execution.execute(payload, context);
        lastExecutionOutput = execResult.output;

        // Augment payload for verification
        const verifyPayload = { ...payload, proposed: execResult.output };
        const verifyResult = await verification.execute(verifyPayload, context);

        const verifyStatus = verifyResult.output?.status?.toUpperCase();
        if (verifyStatus === "PASSED" || verifyStatus === "PASS") {
          return {
            output: lastExecutionOutput,
            confidence: verifyResult.confidence,
            reasoning: verifyResult.reasoning,
            durationMs: execResult.durationMs + verifyResult.durationMs
          };
        }
        
        onEvent("Verification", "running", `Verification failed (attempt ${attempts}). Retrying execution...`);
        // Feed failure back into payload for next execution
        payload.VerificationFeedback = verifyResult.reasoning;
      }
      throw new Error("VerifiedExecution failed after max retries.");
    }
  };

  orchestrator.registerNode({
    name: "VerifiedExecution",
    agent: verifiedExecutionAgent as any,
    dependencies: ["ToolSelection"]
  });

  // Level 7
  orchestrator.registerNode(wrapNode(reflection, ["VerifiedExecution"]));

  return orchestrator;
}
