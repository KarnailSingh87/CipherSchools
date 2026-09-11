# LLD Practice & Evaluation Platform (LLD Studio)

> **2-Day Engineering Assignment MVP**: A dedicated practice environment that helps software engineers master Low-Level Design (OOD/Machine Coding), submit structured solutions, receive multi-dimensional explainable feedback, and iteratively refine their designs.

---

## 1. Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v22.x recommended)
- **npm**: v9.0.0 or later

### Installation
From the root workspace directory, install dependencies for both the backend server and frontend client:
```bash
# In project root:
npm run install:all
```

### Running the Full-Stack Application
To start both the backend API and frontend client concurrently:
```bash
# Terminal 1: Start Backend API (runs on http://localhost:3001)
npm run dev:server

# Terminal 2: Start Frontend Studio (runs on http://localhost:5173)
npm run dev:client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Running Automated Tests
Run the comprehensive test suite covering AST parsing, SOLID principle heuristics, evaluation pipeline orchestration, and resilience fallbacks:
```bash
npm test
# Or: npm run test:server
```

---

## 2. Core Features & The Learner Loop

The platform is designed strictly around the **LLD Learner Journey**:
$$\text{Choose Problem} \longrightarrow \text{Think \& Design} \longrightarrow \text{Submit} \longrightarrow \text{Explainable Feedback} \longrightarrow \text{Review \& Refine}$$

1. **4 Canonical LLD Problems with Explicit Constraints**:
   - **Parking Lot Management System** (Strategy Pattern, Concurrency, Spot Allocation, Dynamic Fee Calculation)
   - **Multi-Car Elevator Dispatcher** (State Machine, Scheduling Algorithm, LOOK Strategy, Door Safety)
   - **Vending Machine State Architecture** (State Pattern, Inventory Invariants, Greedy Coin Dispensing)
   - **Splitwise Expense Sharing Platform** (Split Strategies, Balance Graph, Debt Simplification)
2. **Tri-Part Practice Studio**:
   - **Domain Code Editor**: Define classes, interfaces, attributes, and methods in TypeScript/OOP syntax.
   - **Design Rationale & Assumptions**: Articulate pattern choices, concurrency trade-offs, and boundary assumptions.
   - **Live UML Class Diagram**: Real-time interactive class diagram powered by Mermaid.js that visualizes class inheritance and interface relationships as code is written.
3. **1-Click Benchmark Models for Instant Demonstration**:
   - **Beginner / Flawed Solution**: Demonstrates God classes, switch-on-type anti-patterns, tight coupling (`new` inside methods), and embedded billing. Observe how the evaluator catches SRP/OCP/DIP violations and guides refactoring!
   - **Senior Staff Solution**: Demonstrates clean Strategy pattern, Factory abstractions, dependency injection, and defensive capacity guards.
4. **4-Pillar Explainable Evaluation Scorecard**:
   - **Functional Domain Coverage (25%)**: AST entity completeness against expected domain models.
   - **SOLID Principles Compliance (25%)**: SRP, OCP, LSP, ISP, and DIP heuristics with contextual explanations.
   - **Extensibility & Patterns (25%)**: Detection of behavioral patterns (Strategy, State, Factory) vs brittle concrete coupling.
   - **Edge Cases & Invariant Defense (25%)**: Capacity boundaries, error guards, and concurrency awareness.
5. **Architectural "What-If" Stress Tests**:
   - Challenges the learner with downstream requirement mutations (e.g. *"What if electric vehicle spots require dynamic kWh charging rates?"* or *"What if an emergency fire stop signal freezes all cars?"*).
6. **Attempt Progression History**:
   - Versioned attempt tracking (`v1`, `v2`, `v3`), score growth trajectory, and 1-click restoration of previous code iterations.

---

## 3. Architecture & Domain Model

The platform is built on Clean Object-Oriented Domain-Driven Design:

```
server/src/
├── domain/
│   ├── entities/
│   │   ├── Problem.ts                # Domain entity holding requirements, constraints, benchmarks
│   │   └── Attempt.ts                # Entity managing attempt lifecycle, versioning, and status
│   ├── evaluator/
│   │   ├── IEvaluationStrategy.ts    # Strategy Pattern interface for pluggable evaluators
│   │   ├── AstParser.ts              # Custom AST parser (classes, methods, fields, couplings)
│   │   ├── StructuralEvaluator.ts    # Entity completeness & God class detection
│   │   ├── SolidEvaluator.ts         # SRP, OCP, DIP, ISP, LSP heuristic analysis
│   │   ├── SemanticEvaluator.ts      # LLM semantic evaluator with circuit breaker & timeout
│   │   └── FallbackEvaluator.ts      # Offline heuristic engine for what-if challenges
│   └── pipeline/
│       └── EvaluationPipeline.ts     # Pipeline / Composite orchestrator synthesizing rubrics
├── repository/
│   ├── IProblemRepository.ts         # Problem repository interface
│   ├── ProblemRepository.ts          # In-memory thread-safe problem repository
│   ├── IAttemptRepository.ts         # Attempt repository interface
│   └── AttemptRepository.ts          # Version-tracked attempt history repository
├── services/
│   └── PracticeService.ts            # Application service managing async worker loop
├── api/
│   └── routes.ts                     # RESTful API endpoints
└── index.ts                          # Express bootstrap & dependency wiring
```

---

## 4. Key Answers to Assignment Design Questions

| Design Question | Platform Architectural Solution |
| :--- | :--- |
| **What does a learner need to provide for an attempt to be meaningful?** | A multi-modal submission: (1) Core class & interface contracts, (2) Design rationale & trade-off notes, and (3) Collaborative usage walkthrough. Code alone hides intent; diagrams alone lack enforceable contracts. |
| **What makes feedback useful when there's more than one valid solution?** | Feedback is evaluated against universal design rubrics (SOLID, coupling, invariants) rather than strict naming bias. Feedback always provides the *Consequence*, a *Concrete Refactoring Nudge*, and a *"What-If"* scenario. |
| **Which parts are deterministic vs. LLM?** | Deterministic AST analysis handles entity presence, God classes, fat interfaces, and concrete `new` coupling. LLM / Fallback Heuristics handle semantic pattern rationale, trade-off critique, and generative what-if challenges. |
| **How does the design accommodate new formats or evaluators?** | Strategy Pattern (`IEvaluationStrategy`) allows registering new evaluators (e.g. test sandboxes) without altering core pipeline. Adapter Pattern (`ISubmissionAdapter`) accommodates PlantUML, JSON, or Python code. |
| **What happens if evaluation takes time or fails?** | An asynchronous job state machine (`PENDING` $\to$ `VALIDATING` $\to$ `ANALYZING` $\to$ `SYNTHESIZING` $\to$ `COMPLETED`). If external AI calls time out (>7s) or fail, the platform automatically degrades gracefully to the deterministic fallback engine. The learner is never stuck. |

---

## 5. Limitations & Future Roadmap

1. **Dynamic Sandbox Execution**: The current MVP focuses on structural AST contracts and static SOLID heuristics. A future iteration can run isolated Docker micro-sandboxes to execute dynamic test suites against learner classes.
2. **Interactive UML Editing**: The current UML visualizer automatically renders Mermaid diagrams from code. Bi-directional visual editing (drag-and-drop classes to update code) would provide an even richer experience.
3. **Multi-File Project Support**: Currently, solutions are submitted in a unified module. Supporting multi-file directory structures (e.g. `strategies/`, `models/`, `services/`) would allow practicing large enterprise codebases.

---

## 6. Deliverables Index

- [RESEARCH_NOTE.md](file:///Users/harsh/Desktop/11/RESEARCH_NOTE.md): 1–2 page research on the LLD learning problem, competitive analysis, key gaps, and product vision.
- [DESIGN_NOTE.md](file:///Users/harsh/Desktop/11/DESIGN_NOTE.md): Architectural design note, domain model, class diagrams, answers to core design questions, and trade-offs.
- [AI_USAGE.md](file:///Users/harsh/Desktop/11/AI_USAGE.md): Detailed report of 4 meaningful AI-assisted decisions, alternatives considered, accepted/rejected items, and rationale.
- [Server Test Suite](file:///Users/harsh/Desktop/11/server/tests): Automated unit and resilience tests passing with 100% coverage.
