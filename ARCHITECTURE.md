# Architecture Guide: Project Omega

## 1. Multi-Agent Orchestration (DAG)

Oversight.ai eschews simple LangChain/sequential architectures in favor of a bespoke, strict-typed Directed Acyclic Graph (DAG) state machine.

### Agent Registry
All agents extend `BaseLLMAgent`, which enforces structured JSON outputs using Google Gemini's `Schema` definitions.
- **Planner**: Broad scope evaluation.
- **Context Extractor**: Noise reduction filter.
- **Memory Agent**: KV/Firestore cross-referencing.
- **Reasoning**: Core logic deduction.
- **Priority**: Urgency assignment.
- **Tool Selection**: Function capability mapping.
- **Execution**: Payload generation.
- **Verification**: Self-healing hallucination check.
- **Reflection**: Confidence scoring and retry routing.

## 2. Real-Time Telemetry (Mission Control)

The frontend `Dashboard.tsx` establishes a Server-Sent Events (SSE) connection with `src/app/api/agent/route.ts`. 
As the DAG executes, the Orchestrator emits real-time telemetry (node status, token usage, latency, confidence). This streams directly to the `MissionControl` UI component, ensuring absolute transparency of the AI's internal monologue.

## 3. Deployment & Google Tech Integration

- **Authentication**: `next-auth` securely bounds Google OAuth scopes (`https://www.googleapis.com/auth/gmail.readonly`, `calendar.events`).
- **Edge Deployment**: API routes are configured for Vercel Edge/Serverless environments with maxDuration limits properly managed.
- **Observability**: A custom trace-context logger (`src/lib/observability/index.ts`) wraps all external I/O (Gemini inference, Google APIs).
