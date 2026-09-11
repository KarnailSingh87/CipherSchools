import { describe, it, expect } from 'vitest';
import { EvaluationPipeline } from '../src/domain/pipeline/EvaluationPipeline.js';
import { seedProblems } from '../src/seed/seedProblems.js';

describe('EvaluationPipeline', () => {
  const pipeline = new EvaluationPipeline();
  const parkingLot = seedProblems[0];

  it('correctly executes full evaluation and synthesizes all 4 rubrics', async () => {
    const cleanBenchmark = parkingLot.benchmarks.find(b => b.level === 'SENIOR_CLEAN')!;
    const result = await pipeline.execute({
      code: cleanBenchmark.code,
      language: 'typescript',
      rationale: cleanBenchmark.rationale
    }, parkingLot);

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(['A', 'B']).toContain(result.overallGrade);
    expect(result.rubricScores.length).toBe(4);

    const categories = result.rubricScores.map(r => r.category);
    expect(categories).toContain('REQUIREMENTS');
    expect(categories).toContain('SOLID');
    expect(categories).toContain('EXTENSIBILITY');
    expect(categories).toContain('EDGE_CASES');

    expect(result.whatIfChallenges.length).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('rejects empty submission with descriptive error', async () => {
    await expect(
      pipeline.execute({ code: '', language: 'typescript' }, parkingLot)
    ).rejects.toThrow('SUBMISSION_EMPTY_CODE');
  });

  it('gracefully falls back when evaluating beginner flawed solution', async () => {
    const flawed = parkingLot.benchmarks.find(b => b.level === 'BEGINNER_FLAWED')!;
    const result = await pipeline.execute({
      code: flawed.code,
      language: 'typescript'
    }, parkingLot);

    // Score should reflect flawed design
    expect(result.overallScore).toBeLessThan(75);
    expect(result.feedbackItems.length).toBeGreaterThan(0);
    expect(result.evaluatedBy).toBe('FALLBACK_HEURISTIC');
  });
});
