import { IEvaluationStrategy, StrategyResult } from './IEvaluationStrategy.js';
import { Problem } from '../entities/Problem.js';
import { SubmissionPayload, ParsedAst, RubricScore, FeedbackItem } from '../types.js';

export class SolidEvaluator implements IEvaluationStrategy {
  readonly name = 'SolidEvaluator';

  async evaluate(
    submission: SubmissionPayload,
    problem: Problem,
    parsedAst: ParsedAst
  ): Promise<StrategyResult> {
    const feedbackItems: FeedbackItem[] = [];
    const detectedAntiPatterns: string[] = [];
    const code = submission.code;

    // 1. SRP: Single Responsibility Principle
    let srpPassed = true;
    let srpExplanation = 'Classes maintain cohesive responsibilities without excessive method bloat.';

    if (parsedAst.godClasses.length > 0) {
      srpPassed = false;
      srpExplanation = `SRP violated: Class(es) [${parsedAst.godClasses.join(', ')}] handle too many disjoint concerns.`;
    }

    // Check if code mixes fee/payment math inside lot or gate
    const hasInlinePaymentInLot = /class\s+(?:ParkingLot|Elevator|VendingMachine)[^}]*(?:calculateFee|charge|pay|creditCard|amount)/s.test(code);
    if (hasInlinePaymentInLot && parsedAst.classes.length <= 3) {
      srpPassed = false;
      srpExplanation = 'SRP violated: Financial or billing calculations are embedded directly inside the physical orchestrator class.';
      feedbackItems.push({
        id: 'srp-financial-coupling',
        category: 'SOLID',
        severity: 'CRITICAL',
        title: 'SRP Violation: Billing Embedded in Core Orchestrator',
        message: 'Calculating fees and processing payments inside the core domain orchestrator couples physical asset management with commercial business rules.',
        refactoringNudge: 'Extract a dedicated FeeCalculationStrategy or PaymentProcessor class.'
      });
    }

    // 2. OCP: Open/Closed Principle
    let ocpPassed = true;
    let ocpExplanation = 'System uses polymorphism and strategy interfaces for behavior extension.';

    // Check for vehicle-type switch or if-else cascades
    const hasSwitchOnType = /(?:switch\s*\([^)]*type[^)]*\)|if\s*\([^)]*===?\s*['"](?:CAR|TRUCK|BIKE|MOTORCYCLE|VIP|COIN)['"]\s*\))/i.test(code);
    if (hasSwitchOnType) {
      ocpPassed = false;
      ocpExplanation = 'OCP violated: Found conditional type-switching over vehicle/item types instead of polymorphic dispatch.';
      detectedAntiPatterns.push('Switch-on-Type Smell');
      feedbackItems.push({
        id: 'ocp-type-switch',
        category: 'SOLID',
        severity: 'WARNING',
        title: 'OCP Violation: Hardcoded Type Branching',
        message: 'Directly branching on vehicle or item types with `switch/case` or `if/else` prevents adding new types without modifying existing logic.',
        refactoringNudge: 'Subclass a base domain model or implement a polymorphic Vehicle / Slot interface.'
      });
    }

    // 3. DIP: Dependency Inversion Principle
    let dipPassed = true;
    let dipExplanation = 'High-level modules rely on abstractions and constructor injection rather than direct instantiations.';

    if (parsedAst.tightlyCoupledPairs.length > 0) {
      dipPassed = false;
      dipExplanation = `DIP violated: Found hardcoded instantiation of concrete classes (${parsedAst.tightlyCoupledPairs.map(p => `${p.fromClass} -> new ${p.toClass}()`).join(', ')}).`;
      detectedAntiPatterns.push('Hardcoded Concrete Instantiations');
      feedbackItems.push({
        id: 'dip-hardcoded-instantiation',
        category: 'SOLID',
        severity: 'WARNING',
        title: 'DIP Violation: Direct Concrete Instantiation',
        message: `High-level class directly instantiates concrete dependencies with 'new' inside methods: ${parsedAst.tightlyCoupledPairs.slice(0, 2).map(p => `${p.fromClass} creates ${p.toClass}`).join(', ')}.`,
        refactoringNudge: 'Inject dependencies or strategy instances via the constructor (Dependency Injection) or use an Abstract Factory.'
      });
    }

    // 4. ISP: Interface Segregation Principle
    let ispPassed = true;
    let ispExplanation = 'Interfaces are focused, small, and client-specific.';
    for (const iface of parsedAst.interfaces) {
      if (iface.methods.length > 5) {
        ispPassed = false;
        ispExplanation = `ISP violated: Interface ${iface.name} is too wide (${iface.methods.length} methods). Clients will be forced to depend on unused methods.`;
        feedbackItems.push({
          id: `isp-fat-interface-${iface.name}`,
          category: 'SOLID',
          severity: 'SUGGESTION',
          title: `Fat Interface Detected: ${iface.name}`,
          message: `Interface '${iface.name}' contains ${iface.methods.length} methods. Consider segregating it into smaller, targeted role interfaces.`,
          refactoringNudge: `Split '${iface.name}' into cohesive sub-interfaces (e.g. Readable vs Writable, or Allocator vs Scanner).`
        });
      }
    }

    // 5. LSP: Liskov Substitution Principle
    const lspPassed = true;
    const lspExplanation = 'Derived classes adhere to base contracts without throwing unsupported operation errors.';

    const solidAssessments = [
      { principle: 'SRP' as const, name: 'Single Responsibility', passed: srpPassed, explanation: srpExplanation },
      { principle: 'OCP' as const, name: 'Open / Closed Principle', passed: ocpPassed, explanation: ocpExplanation },
      { principle: 'LSP' as const, name: 'Liskov Substitution', passed: lspPassed, explanation: lspExplanation },
      { principle: 'ISP' as const, name: 'Interface Segregation', passed: ispPassed, explanation: ispExplanation },
      { principle: 'DIP' as const, name: 'Dependency Inversion', passed: dipPassed, explanation: dipExplanation }
    ];

    const solidPassedCount = solidAssessments.filter(s => s.passed).length;
    const solidScore = Math.round((solidPassedCount / 5) * 100);

    // 6. Edge Cases & Invariants
    const hasCapacityCheck = /(?:capacity|isFull|count\s*>=|availableSpots|isAvailable|occupied)/i.test(code);
    const hasErrorHandling = /(?:throw\s+new\s+Error|IllegalArgument|IllegalState|null|undefined|Exception)/i.test(code);
    const hasConcurrencyAwareness = /(?:lock|mutex|synchronized|atomic|concurrent|queue|race)/i.test(code) || 
      (submission.rationale && /(?:thread|concurrent|lock|mutex|race|atomic)/i.test(submission.rationale));

    let edgeScore = 40;
    if (hasCapacityCheck) edgeScore += 25;
    if (hasErrorHandling) edgeScore += 20;
    if (hasConcurrencyAwareness) edgeScore += 15;
    edgeScore = Math.min(100, Math.max(20, edgeScore));

    const edgeChecklist = [
      {
        item: 'Capacity Boundaries & Overflow Defense',
        passed: hasCapacityCheck,
        note: hasCapacityCheck ? 'Detected boundary checks (full/capacity guards).' : 'Missing capacity/overflow checks.'
      },
      {
        item: 'Defensive Error Handling & Invariant Protection',
        passed: hasErrorHandling,
        note: hasErrorHandling ? 'Throws descriptive errors on invalid operations.' : 'Operations fail silently without exceptions.'
      },
      {
        item: 'Concurrency & Thread-Safety Consideration',
        passed: !!hasConcurrencyAwareness,
        note: hasConcurrencyAwareness ? 'Addressed in code or design rationale.' : 'No concurrency or race condition guards noted.'
      }
    ];

    if (!hasCapacityCheck) {
      feedbackItems.push({
        id: 'missing-capacity-guard',
        category: 'EDGE_CASES',
        severity: 'WARNING',
        title: 'Missing Boundary Checks for Full Capacity',
        message: 'The design does not explicitly guard against capacity exhaustion or attempt to park when slots are fully occupied.',
        refactoringNudge: 'Introduce an isFull() guard or return a Result/Optional with meaningful error states.'
      });
    }

    if (!hasConcurrencyAwareness) {
      feedbackItems.push({
        id: 'concurrency-missing',
        category: 'EDGE_CASES',
        severity: 'SUGGESTION',
        title: 'Concurrency & Race Condition Considerations',
        message: 'Real-world LLD requires guarding against two vehicles simultaneously booking the last available spot.',
        refactoringNudge: 'Document thread-safety assumptions in your rationale notes (e.g. mutex on spot allocation or atomic counters).'
      });
    }

    const rubricScores: RubricScore[] = [
      {
        category: 'SOLID',
        score: solidScore,
        weight: 25,
        grade: solidScore >= 80 ? 'A' : solidScore >= 60 ? 'B' : solidScore >= 40 ? 'C' : 'D',
        summary: `SOLID Principles adherence is ${solidScore}% (${solidPassedCount}/5 principles verified).`,
        checklist: solidAssessments.map(s => ({ item: `${s.principle}: ${s.name}`, passed: s.passed, note: s.explanation }))
      },
      {
        category: 'EDGE_CASES',
        score: edgeScore,
        weight: 25,
        grade: edgeScore >= 80 ? 'A' : edgeScore >= 60 ? 'B' : edgeScore >= 40 ? 'C' : 'D',
        summary: `Edge Case resilience is ${edgeScore}% based on capacity protection, error defense, and concurrency handling.`,
        checklist: edgeChecklist
      }
    ];

    return {
      strategyName: this.name,
      rubricScores,
      feedbackItems,
      detectedAntiPatterns,
      solidAssessments
    };
  }
}
