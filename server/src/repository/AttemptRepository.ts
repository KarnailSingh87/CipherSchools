import { IAttemptRepository } from './IAttemptRepository.js';
import { Attempt } from '../domain/entities/Attempt.js';

export class AttemptRepository implements IAttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  async findById(id: string): Promise<Attempt | undefined> {
    return this.attempts.get(id);
  }

  async findByProblemId(problemId: string): Promise<Attempt[]> {
    const list: Attempt[] = [];
    for (const a of this.attempts.values()) {
      if (a.problemId === problemId) {
        list.push(a);
      }
    }
    return list.sort((a, b) => a.version - b.version);
  }

  async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }

  async getNextVersion(problemId: string): Promise<number> {
    const existing = await this.findByProblemId(problemId);
    if (existing.length === 0) return 1;
    const maxVersion = Math.max(...existing.map(a => a.version));
    return maxVersion + 1;
  }
}
