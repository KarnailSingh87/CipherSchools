import { describe, it, expect } from 'vitest';
import { SolidEvaluator } from '../src/domain/evaluator/SolidEvaluator.js';
import { AstParser } from '../src/domain/evaluator/AstParser.js';
import { seedProblems } from '../src/seed/seedProblems.js';

describe('SolidEvaluator', () => {
  const parkingLotProblem = seedProblems[0];
  const evaluator = new SolidEvaluator();

  it('detects OCP violation when code switches over vehicle types', async () => {
    const flawedCode = `
      export class ParkingLot {
        calculateFee(type: string, hours: number) {
          if (type === "CAR") return hours * 20;
          else if (type === "TRUCK") return hours * 50;
          else return hours * 10;
        }
      }
    `;

    const ast = AstParser.parse(flawedCode);
    const result = await evaluator.evaluate(
      { code: flawedCode, language: 'typescript' },
      parkingLotProblem,
      ast
    );

    const ocpCheck = result.solidAssessments?.find(s => s.principle === 'OCP');
    expect(ocpCheck?.passed).toBe(false);
    expect(result.detectedAntiPatterns).toContain('Switch-on-Type Smell');
  });

  it('passes DIP and OCP when clean interfaces and strategy are used', async () => {
    const cleanBenchmark = parkingLotProblem.benchmarks.find(b => b.level === 'SENIOR_CLEAN')!;
    const ast = AstParser.parse(cleanBenchmark.code);
    const result = await evaluator.evaluate(
      { code: cleanBenchmark.code, language: 'typescript', rationale: cleanBenchmark.rationale },
      parkingLotProblem,
      ast
    );

    const ocpCheck = result.solidAssessments?.find(s => s.principle === 'OCP');
    expect(ocpCheck?.passed).toBe(true);

    const solidRubric = result.rubricScores.find(r => r.category === 'SOLID');
    expect(solidRubric).toBeDefined();
    expect(solidRubric!.score).toBeGreaterThanOrEqual(80);
  });
});
