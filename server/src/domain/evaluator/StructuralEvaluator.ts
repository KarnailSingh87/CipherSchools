import { IEvaluationStrategy, StrategyResult } from './IEvaluationStrategy.js';
import { Problem } from '../entities/Problem.js';
import { SubmissionPayload, ParsedAst, RubricScore, FeedbackItem } from '../types.js';

export class StructuralEvaluator implements IEvaluationStrategy {
  readonly name = 'StructuralEvaluator';

  async evaluate(
    submission: SubmissionPayload,
    problem: Problem,
    parsedAst: ParsedAst
  ): Promise<StrategyResult> {
    const feedbackItems: FeedbackItem[] = [];
    const detectedPatterns: string[] = [];
    const detectedAntiPatterns: string[] = [];

    // 1. Check Domain Entities Presence
    const declaredEntityNames = [...parsedAst.allClassNames, ...parsedAst.allInterfaceNames].map(s => s.toLowerCase());
    const missingEntities: string[] = [];
    const foundEntities: string[] = [];

    for (const expected of problem.expectedDomainEntities) {
      const match = declaredEntityNames.some(d => d.includes(expected.toLowerCase()) || expected.toLowerCase().includes(d));
      if (match) {
        foundEntities.push(expected);
      } else {
        missingEntities.push(expected);
      }
    }

    const coverageRatio = problem.expectedDomainEntities.length > 0 
      ? foundEntities.length / problem.expectedDomainEntities.length 
      : 1;

    let reqScore = Math.round(coverageRatio * 75);
    if (parsedAst.classes.length >= 3) reqScore += 15;
    if (parsedAst.totalLines >= 40) reqScore += 10;
    reqScore = Math.min(100, Math.max(10, reqScore));

    const reqChecklist = [
      {
        item: `Domain Entities Coverage (${foundEntities.length}/${problem.expectedDomainEntities.length})`,
        passed: coverageRatio >= 0.75,
        note: missingEntities.length > 0 ? `Missing entities: ${missingEntities.join(', ')}` : 'All key entities present.'
      },
      {
        item: 'Adequate Class Decomposition (at least 3 distinct classes)',
        passed: parsedAst.classes.length >= 3,
        note: `Identified ${parsedAst.classes.length} classes: ${parsedAst.allClassNames.join(', ') || 'None'}`
      },
      {
        item: 'Sufficient Implementation Depth',
        passed: parsedAst.totalLines >= 35,
        note: `${parsedAst.totalLines} lines analyzed.`
      }
    ];

    if (missingEntities.length > 0) {
      feedbackItems.push({
        id: 'missing-entities',
        category: 'REQUIREMENTS',
        severity: 'WARNING',
        title: 'Core Domain Entities Missing',
        message: `Your design is missing core entities identified in the requirements: ${missingEntities.join(', ')}.`,
        refactoringNudge: `Consider explicitly introducing separate models for ${missingEntities[0]} to capture its specific lifecycle and invariants.`
      });
    } else {
      feedbackItems.push({
        id: 'strong-domain-coverage',
        category: 'REQUIREMENTS',
        severity: 'PRAISE',
        title: 'Comprehensive Domain Representation',
        message: `Great job capturing all expected domain entities (${foundEntities.join(', ')}). The boundary responsibilities are clearly demarcated.`
      });
    }

    // 2. God Class / Monolith Detection
    if (parsedAst.godClasses.length > 0) {
      detectedAntiPatterns.push('God Object / Blob Class');
      for (const god of parsedAst.godClasses) {
        feedbackItems.push({
          id: `god-class-${god}`,
          category: 'SOLID',
          severity: 'CRITICAL',
          title: `Blob Class Detected: ${god}`,
          message: `Class "${god}" accumulates excessive methods (${parsedAst.classes.find(c => c.name === god)?.methods.length} methods), likely managing orchestration, persistence, and state transitions concurrently.`,
          refactoringNudge: `Decompose "${god}" into specialized delegates (e.g. an AllocationService, PaymentProcessor, or StateController).`
        });
      }
    }

    // 3. Extensibility & Interface Abstraction
    const interfaceCount = parsedAst.interfaces.length + parsedAst.classes.filter(c => c.isAbstract).length;
    let extScore = 50;

    if (interfaceCount > 0) {
      extScore += Math.min(35, interfaceCount * 15);
      detectedPatterns.push('Interface-Based Abstraction');
    } else {
      detectedAntiPatterns.push('Concrete Class Dependency');
      feedbackItems.push({
        id: 'no-interfaces',
        category: 'EXTENSIBILITY',
        severity: 'WARNING',
        title: 'Absence of Behavioral Interfaces',
        message: 'No interfaces or abstract base classes were detected. Relying solely on concrete classes prevents swapping algorithms or strategies at runtime.',
        refactoringNudge: 'Define interfaces for variable behavior (e.g. IPricingStrategy, IAllocationStrategy, or IState).'
      });
    }

    // Check for Strategy or State pattern naming
    const strategyLike = parsedAst.allInterfaceNames.concat(parsedAst.allClassNames).some(n => 
      n.toLowerCase().includes('strategy') || n.toLowerCase().includes('algorithm') || n.toLowerCase().includes('policy')
    );
    if (strategyLike) {
      detectedPatterns.push('Strategy Pattern');
      extScore += 15;
    }

    const stateLike = parsedAst.allInterfaceNames.concat(parsedAst.allClassNames).some(n => 
      n.toLowerCase().includes('state') || n.toLowerCase().includes('status')
    );
    if (stateLike) {
      detectedPatterns.push('State Pattern');
      extScore += 10;
    }

    const factoryLike = parsedAst.allClassNames.some(n => n.toLowerCase().includes('factory'));
    if (factoryLike) {
      detectedPatterns.push('Factory Pattern');
      extScore += 10;
    }

    extScore = Math.min(100, Math.max(15, extScore));

    const extChecklist = [
      {
        item: 'Polymorphic Abstractions (Interfaces / Abstract Base Classes)',
        passed: interfaceCount > 0,
        note: `${interfaceCount} abstraction(s) detected.`
      },
      {
        item: 'Design Pattern Alignment (Strategy, State, or Factory)',
        passed: detectedPatterns.length > 0,
        note: detectedPatterns.length > 0 ? `Patterns: ${detectedPatterns.join(', ')}` : 'No formal behavioral pattern detected.'
      },
      {
        item: 'Absence of God Classes',
        passed: parsedAst.godClasses.length === 0,
        note: parsedAst.godClasses.length === 0 ? 'Good class sizing.' : `God classes: ${parsedAst.godClasses.join(', ')}`
      }
    ];

    const rubricScores: RubricScore[] = [
      {
        category: 'REQUIREMENTS',
        score: reqScore,
        weight: 25,
        grade: reqScore >= 85 ? 'A' : reqScore >= 70 ? 'B' : reqScore >= 55 ? 'C' : 'D',
        summary: `Domain modeling coverage is ${reqScore}% based on required entity abstractions and depth.`,
        checklist: reqChecklist
      },
      {
        category: 'EXTENSIBILITY',
        score: extScore,
        weight: 25,
        grade: extScore >= 85 ? 'A' : extScore >= 70 ? 'B' : extScore >= 55 ? 'C' : 'D',
        summary: `Extensibility rating is ${extScore}% based on interface usage, pattern separation, and coupling.`,
        checklist: extChecklist
      }
    ];

    return {
      strategyName: this.name,
      rubricScores,
      feedbackItems,
      detectedPatterns,
      detectedAntiPatterns
    };
  }
}
