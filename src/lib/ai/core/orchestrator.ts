import { logger, TraceContext } from "@/lib/observability";
import { Agent } from "./agent";

export interface OrchestratorState {
  trace: TraceContext;
  status: "idle" | "running" | "completed" | "failed";
  history: Array<{ node: string; output: any; durationMs: number }>;
  payload: Record<string, any>;
  errors: Record<string, Error>;
}

export interface DagNode {
  name: string;
  agent: Agent<any, any>;
  dependencies: string[]; // Node names that must complete before this runs
  condition?: (state: OrchestratorState) => boolean; // Optional dynamic check to skip the node
}

export class Orchestrator {
  private nodes: Map<string, DagNode> = new Map();
  private onEvent?: (node: string, status: string, message: string, meta?: any) => void;

  constructor(onEvent?: (node: string, status: string, message: string, meta?: any) => void) {
    this.onEvent = onEvent;
  }

  public registerNode(node: DagNode) {
    this.nodes.set(node.name, node);
  }

  public async execute(initialPayload: Record<string, any>, trace: TraceContext): Promise<OrchestratorState> {
    const state: OrchestratorState = {
      trace,
      status: "running",
      history: [],
      payload: { ...initialPayload },
      errors: {}
    };

    logger.info("Orchestrator", `Starting Parallel DAG Execution`, undefined, trace);

    const completedNodes = new Set<string>();
    const activeNodes = new Set<string>();
    const failedNodes = new Set<string>();
    const skippedNodes = new Set<string>();

    const evaluateGraph = async (): Promise<void> => {
      // Find all nodes that are not yet complete, active, skipped, or failed
      const pendingNodes = Array.from(this.nodes.values()).filter(
        n => !completedNodes.has(n.name) && 
             !activeNodes.has(n.name) && 
             !failedNodes.has(n.name) &&
             !skippedNodes.has(n.name)
      );

      // Find nodes blocked by failed dependencies
      const blockedNodes = pendingNodes.filter(node =>
        node.dependencies.some(dep => failedNodes.has(dep))
      );

      blockedNodes.forEach(node => {
        failedNodes.add(node.name);
        state.errors[node.name] = new Error("Dependency failed");
        this.onEvent?.(node.name, "failed", "Dependency failed");
      });

      // Recalculate pending after removing blocked
      const remainingPending = pendingNodes.filter(node => !blockedNodes.includes(node));

      // Check if we are done
      if (remainingPending.length === 0 && activeNodes.size === 0) {
        return; // Graph execution complete
      }

      // Check if we are deadlocked
      if (remainingPending.length > 0 && activeNodes.size === 0) {
        throw new Error(`DAG Deadlock detected. Pending nodes: ${remainingPending.map(n => n.name).join(", ")}`);
      }

      const readyNodes = remainingPending.filter(node => 
        // A node is ready if ALL its dependencies are in the completed or skipped sets
        node.dependencies.every(dep => completedNodes.has(dep) || skippedNodes.has(dep))
      );

      // Mark ready nodes as active SYNCHRONOUSLY to prevent duplicate execution
      // during concurrent evaluateGraph invocations.
      readyNodes.forEach(node => {
        activeNodes.add(node.name);
      });

      const promises = readyNodes.map(async (node) => {
        // Evaluate condition
        if (node.condition && !node.condition(state)) {
          logger.debug("Orchestrator", `Skipping node ${node.name} due to condition`, undefined, trace);
          this.onEvent?.(node.name, "completed", "Skipped conditionally.", { durationMs: 0 });
          skippedNodes.add(node.name);
          activeNodes.delete(node.name);
          // Re-evaluate graph immediately since dependencies might have unblocked
          return evaluateGraph(); 
        }

        logger.debug("Orchestrator", `Executing node ${node.name}`, undefined, trace);
        this.onEvent?.(node.name, "running", `Starting execution...`);
        
        try {
          const result = await node.agent.execute(state.payload, { trace });
          
          state.history.push({
            node: node.name,
            output: result.output,
            durationMs: result.durationMs
          });
          
          state.payload[node.name] = result.output;
          
          this.onEvent?.(node.name, "completed", result.reasoning, {
            confidence: result.confidence,
            durationMs: result.durationMs,
            tokens: result.usage?.totalTokens
          });

          completedNodes.add(node.name);
        } catch (error: any) {
          state.errors[node.name] = error;
          failedNodes.add(node.name);
          this.onEvent?.(node.name, "failed", error.message || "Execution failed");
          // The cascading logic will handle dependent nodes.
          // return evaluateGraph(); // do not throw, just trigger next evaluation
        } finally {
          activeNodes.delete(node.name);
        }

        // Trigger next wave of evaluation
        return evaluateGraph();
      });

      // Wait for all currently spawned ready nodes to finish their subtree
      await Promise.all(promises);
    };

    try {
      await evaluateGraph();
      state.status = "completed";
      logger.info("Orchestrator", `DAG completed successfully`, { steps: state.history.length }, trace);
    } catch (error) {
      state.status = "failed";
      logger.error("Orchestrator", `DAG failed`, { error: String(error) }, trace);
      throw error;
    }

    return state;
  }
}
