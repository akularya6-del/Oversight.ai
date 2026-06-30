# Architecture Decisions

## AD-01: Orchestrator Concurrency Model

**Context:**
The initial Orchestrator used a single-state Finite State Machine (FSM) where only one agent ran at a time. This results in `O(N)` latency, easily violating the 30-second serverless timeout limit.

**Candidates:**
1.  **Fully Asynchronous Background Jobs (Vercel KV + CRON)**: Decouples execution from the HTTP request. Client polls for updates.
2.  **Client-Driven Chunking**: Client makes N sequential HTTP requests for each DAG node.
3.  **True Parallel DAG Executor in Serverless**: Redesign the Orchestrator to execute nodes concurrently as soon as their defined `dependencies` are met, using `Promise.all` and a dependency graph resolver.

**Comparison:**
- *Candidate 1* offers infinite execution time but breaks the real-time SSE stream architecture and introduces polling latency.
- *Candidate 2* adds significant network round-trip overhead.
- *Candidate 3* maintains the elegant single-connection SSE stream while theoretically cutting latency by 40-50% depending on graph width.

**Selection:**
We select **Candidate 3 (Parallel DAG Executor)**.

**Rationale Objectivity:**
By parallelizing independent nodes (e.g., Context Extraction and Planner can run simultaneously; Verification and Reflection can pipeline), we mathematically reduce the critical path latency. Combined with `gemini-2.5-flash`, the P99 latency will comfortably sit under the 30s threshold, retaining the UX benefit of a continuous SSE stream without requiring Redis infrastructure.

## AD-02: Circuit Breakers & Infinite Loop Mitigation

**Context:**
The current FSM allows the Verification Agent to reject execution and route back to Execution infinitely.

**Candidates:**
1.  **Hard Max Retries**: Give up after N total pipeline steps.
2.  **Node-Specific Retry Limits**: Track retries per DAG edge. If `Execution -> Verification` loops > 2 times, fallback to a degraded state or human-in-the-loop.
3.  **LLM Self-Correction History**: Pass previous failures into the prompt so it learns.

**Selection:**
We select a hybrid of **Candidate 2 & 3**.

**Rationale:**
Passing failure context (Candidate 3) increases the chance of success on retry. Capping the edge traversals (Candidate 2) guarantees termination.

## AD-03: PII Masking Architecture
**Decision:** Dedicated LLM Sanitization Node (Gemini-Flash).
**Rationale:** More accurate than Regex for unstructured conversational text, without the massive setup overhead of GCP DLP API. Fits perfectly as the DAG's new root node.

## AD-04: Proactive Context Architecture
**Decision:** Dedicated PreBriefing Agent Node.
**Rationale:** Runs concurrently with Context Extractor in the parallel DAG. Generates "upcoming meeting" briefs, shifting the product from purely reactionary to truly proactive.

## AD-05: Mobile Mission Control & Skeletons

**Context:**
The `MissionControl.tsx` component is currently a fixed bottom-right widget. On mobile, this will cover the action cards or overflow the viewport.

**Decision:**
Refactor `MissionControl.tsx` to use Framer Motion for a bottom-sheet (drawer) paradigm on mobile (max-width: 768px) while preserving the floating widget on desktop.

**Rationale:**
This ensures the primary UX (Action Queue) remains interactive on all devices while keeping the critical telemetry visible.

## AD-06: Localized "Retry Node" Capability

**Context:**
The UX backlog requested a UI button to retry a specific failed node.

**Decision:**
Deferred. The Orchestrator manages automated retries (maxAttempts = 3) on the backend via the `VerifiedExecution` composite node. 

**Rationale:**
Exposing a manual "Retry Node" button to the client requires breaking the serverless execution model into a chunked, client-driven state machine (rejected in AD-01 due to latency). We prioritize automated self-healing and zero-latency over manual human-in-the-loop debugging for a hackathon demo.
