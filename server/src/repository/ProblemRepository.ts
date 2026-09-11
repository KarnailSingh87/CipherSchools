import { IProblemRepository } from './IProblemRepository.js';
import { Problem } from '../domain/entities/Problem.js';
import { seedProblems } from '../seed/seedProblems.js';

export class ProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  constructor() {
    // Initialize with canonical seed problems
    for (const p of seedProblems) {
      this.problems.set(p.id, p);
    }
  }

  async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  async findById(id: string): Promise<Problem | undefined> {
    return this.problems.get(id);
  }

  async findBySlug(slug: string): Promise<Problem | undefined> {
    for (const p of this.problems.values()) {
      if (p.slug === slug) return p;
    }
    return undefined;
  }

  async save(problem: Problem): Promise<void> {
    this.problems.set(problem.id, problem);
  }
}
