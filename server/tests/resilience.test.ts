import { describe, it, expect } from 'vitest';
import { ProblemRepository } from '../src/repository/ProblemRepository.js';
import { AttemptRepository } from '../src/repository/AttemptRepository.js';
import { PracticeService } from '../src/services/PracticeService.js';

describe('Resilience and Repository Service', () => {
  it('increments version numbers correctly for consecutive attempts on same problem', async () => {
    const problemRepo = new ProblemRepository();
    const attemptRepo = new AttemptRepository();
    const service = new PracticeService(problemRepo, attemptRepo);

    const att1 = await service.createAndEvaluateAttempt('parking-lot', {
      code: 'export class TestLot {}',
      language: 'typescript'
    });
    expect(att1.version).toBe(1);

    const att2 = await service.createAndEvaluateAttempt('parking-lot', {
      code: 'export class TestLotV2 {}',
      language: 'typescript'
    });
    expect(att2.version).toBe(2);

    // Wait for background evaluation to settle
    await new Promise(r => setTimeout(r, 1200));

    const history = await service.getProblemAttempts('parking-lot');
    expect(history.length).toBe(2);
    expect(history[0].version).toBe(1);
    expect(history[1].version).toBe(2);
    expect(history[0].status).toBe('COMPLETED');
    expect(history[1].status).toBe('COMPLETED');
  });

  it('throws error when submitting to non-existent problem', async () => {
    const problemRepo = new ProblemRepository();
    const attemptRepo = new AttemptRepository();
    const service = new PracticeService(problemRepo, attemptRepo);

    await expect(
      service.createAndEvaluateAttempt('non-existent-problem', {
        code: 'export class X {}',
        language: 'typescript'
      })
    ).rejects.toThrow('Problem not found');
  });
});
