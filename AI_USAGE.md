# AI Usage Report: Architectural Decisions & Rationale

**Project**: Low-Level Design (LLD) Practice Platform  
**Author**: Engineering Team  
**Date**: September 2026  

In developing the LLD Practice Platform, AI tools (LLM assistants) were used collaboratively to brainstorm trade-offs, draft AST regex patterns, and explore edge cases. In accordance with the project guidelines, this document details **4 meaningful AI-assisted decisions**, highlighting what the AI suggested, what was accepted or rejected, and the engineering rationale behind each decision.

---

## Decision 1: Deterministic AST & Heuristics vs. Pure LLM Scoring

### What the AI Suggested
The AI initially proposed routing the entire evaluation through an LLM prompt:
> *"Pass the candidate's code and problem description to GPT-4o / Gemini 1.5 with a JSON schema instructing it to score 4 rubrics from 0–100, detect SOLID violations, and output line-by-line feedback."*

### What We Accepted vs. Rejected
- **Rejected**: We rejected relying purely on an LLM for scoring and rule verification.
- **Accepted**: We designed and implemented a **Dual-Track Hybrid Pipeline**:
  1. A deterministic AST and structural parser that checks entity completeness, God classes (>6 methods), concrete couplings (`new` inside methods), and type-switch anti-patterns.
  2. A fallback heuristic engine that computes exact rubric percentages deterministically.
  3. LLM semantic reasoning reserved for qualitative nuance and what-if generation, wrapped in a circuit breaker with automatic fallback.

### Engineering Rationale
Pure LLM evaluation suffers from three fatal flaws for an evaluation platform:
1. **Non-Determinism & Hallucination**: Submitting the exact same code twice can yield fluctuating scores (e.g. 72% vs. 88%), destroying learner trust.
2. **Praise Bias**: Generalist LLMs tend to be overly polite, rating flawed beginner solutions as "Great job!" rather than strictly enforcing SOLID invariants.
3. **Fragility & Offline Failure**: If rate limits hit, network fails, or no API key is provided, the platform crashes. With our deterministic hybrid approach, the platform is 100% reliable, reproducible, and runnable out-of-the-box.

---

## Decision 2: Multi-Modal Submission (Code + Rationale + Live Diagram) vs. Code-Only

### What the AI Suggested
The AI suggested emulating LeetCode or HackerRank:
> *"Keep the submission input minimal: a single Monaco code editor where the user writes a single `.ts` or `.py` file."*

### What We Accepted vs. Rejected
- **Rejected**: A code-only submission box.
- **Accepted**: A **Tri-Part Practice Studio**:
  1. **Core Domain Code**: Classes, interfaces, and methods.
  2. **Design Rationale & Assumptions**: Explicit notes where learners justify why they chose Strategy over State, document concurrency locks, or explain scalability trade-offs.
  3. **Live UML Visualizer**: Real-time rendering of the object hierarchy and relationships as code is typed.

### Engineering Rationale
In real engineering and machine coding interviews, code alone tells only half the story. A candidate may deliberately choose a simple HashMap over a complex database abstraction due to scale assumptions. Providing a dedicated space for design rationale elevates the exercise from a syntax drill to true architectural practice, and enables the evaluation pipeline to evaluate *intent* alongside *execution*.

---

## Decision 3: Client-Side Mermaid.js AST vs. Server-Side PlantUML

### What the AI Suggested
The AI suggested setting up a server-side endpoint running a Java process with PlantUML:
> *"Spin up a child process or Docker container executing `plantuml.jar` to render PNG/SVG class diagrams from student code."*

### What We Accepted vs. Rejected
- **Rejected**: Server-side PlantUML Java rendering.
- **Accepted**: In-browser client-side dynamic Mermaid.js generation.

### Engineering Rationale
Introducing PlantUML on the server creates heavy host dependencies (Java JDK, Graphviz `dot` binaries, font libraries) and risks security vulnerabilities from untrusted code execution. In contrast, client-side Mermaid.js runs in sandboxed WebAssembly/JavaScript, has zero server latency, updates instantaneously as the user types, and works out-of-the-box on any machine.

---

## Decision 4: In-Process Asynchronous Worker State Machine vs. Distributed Queue (Kafka/BullMQ)

### What the AI Suggested
The AI suggested a microservice event architecture:
> *"Deploy Redis with BullMQ or Kafka to queue submission jobs, with a separate worker pool processing evaluations and updating a PostgreSQL database."*

### What We Accepted vs. Rejected
- **Rejected**: Distributed queues, Redis, and Kafka.
- **Accepted**: An in-process asynchronous state machine with polling (`PENDING` $\to$ `VALIDATING` $\to$ `ANALYZING` $\to$ `SYNTHESIZING` $\to$ `COMPLETED`).

### Engineering Rationale
The assignment instructions explicitly define the scope boundary:
> *"This is primarily an LLD/domain-design exercise. Do not spend the majority of your time on Kubernetes, microservices... A simple monolith is completely acceptable."*

Introducing Redis and Kafka adds zero pedagogical value to the learner while introducing massive operational friction for reviewers running the project. Our in-process asynchronous state machine implements the exact same asynchronous client experience (immediate HTTP 202 response, progressive step indicators, pollable attempt ID) while keeping the repository pure, clean, and executable with a single `npm start` command.
