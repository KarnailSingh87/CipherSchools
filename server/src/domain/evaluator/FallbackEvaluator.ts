import { Problem } from '../entities/Problem.js';
import { SubmissionPayload, ParsedAst } from '../types.js';

export interface QualitativeInsights {
  summary: string;
  whatIfChallenges: string[];
  refinementNudges: string[];
}

export class FallbackEvaluator {
  /**
   * Generates rich, contextual feedback and "What-If" architectural challenges
   * tailored to the specific problem domain when LLM is unavailable or times out.
   */
  static generateInsights(
    submission: SubmissionPayload,
    problem: Problem,
    parsedAst: ParsedAst,
    overallScore: number
  ): QualitativeInsights {
    const whatIfChallenges: string[] = [];
    const refinementNudges: string[] = [];

    // Domain-tailored What-If challenges
    if (problem.slug === 'parking-lot') {
      whatIfChallenges.push(
        'Dynamic Pricing: How would your design handle surge pricing where hourly rates double during peak morning hours?',
        'Specialized Spot Types: Suppose we introduce Electric Vehicle (EV) spots that require tracking kWh consumption alongside time. Can your Spot abstraction support this without modification?',
        'Multi-Gate Concurrency: If 5 entry gates simultaneously attempt to allocate the nearest spot to incoming cars, how does your design prevent double-booking?'
      );
    } else if (problem.slug === 'elevator-system') {
      whatIfChallenges.push(
        'Dispatching Algorithm Swap: How easily could your Elevator Controller swap from a SCAN (Elevator Algorithm) to an optimized Destination Dispatch system?',
        'Emergency / Fire State: How would your state transitions handle a building-wide fire alarm that commands all cars to the ground floor and disables floor call buttons?',
        'VIP / Priority Override: If an executive keycard triggers an express trip to the penthouse, how does your request queue prioritize it?'
      );
    } else if (problem.slug === 'vending-machine') {
      whatIfChallenges.push(
        'Exact Change Invariant: If a customer inputs a $20 bill for a $2 item, but the machine lacks sufficient change, how does your state machine safely reject the transaction and refund money?',
        'Digital Payments: How would your design introduce QR / NFC contactless payments without rewriting the cash handling logic?',
        'Dual Dispensing: What if a customer buys a bundled combo (Snack + Beverage) in a single atomic transaction?'
      );
    } else if (problem.slug === 'splitwise-expense-sharing') {
      whatIfChallenges.push(
        'Debt Simplification: How would your design incorporate min-cash-flow graph debt simplification (e.g. A owes B $10, B owes C $10 -> A owes C $10)?',
        'Unequal / Shares Split Strategy: If a group splits an expense by custom percentage or share units, how does your SplitStrategy interface validate that total percentages sum to 100%?',
        'Currency Conversion: How would multi-currency expenses settle against a default group base currency?'
      );
    } else {
      whatIfChallenges.push(
        'Scalability Stress Test: If this component needs to scale to 10,000 concurrent operations per second, what bottlenecks exist in your class interfaces?',
        'Audit Logging: Where would an event observer hook into state mutations without coupling domain logic to a telemetry database?'
      );
    }

    // Contextual summary
    let summary = '';
    if (overallScore >= 85) {
      summary = `Excellent architectural design! Your solution demonstrates strong object-oriented domain boundaries, appropriate abstraction of key responsibilities, and thoughtful adherence to SOLID principles. The domain model isolates key volatility points effectively.`;
    } else if (overallScore >= 70) {
      summary = `Solid foundation with good domain representation. The core entities and primary workflows are cleanly structured, though there are key opportunities to decouple volatile dependencies (e.g. strategy extraction, DIP adherence) to achieve true production resilience.`;
    } else if (overallScore >= 50) {
      summary = `Working prototype with domain clarity, but exhibits classic LLD smells such as centralized God classes or direct concrete coupling. Decomposing orchestration from business calculations will dramatically improve maintainability.`;
    } else {
      summary = `Initial attempt requires architectural restructuring. Several core domain entities or interface boundaries are missing or conflated. Focus on modeling the nouns first, identifying responsibilities, and applying the Single Responsibility Principle.`;
    }

    return {
      summary,
      whatIfChallenges,
      refinementNudges
    };
  }
}
