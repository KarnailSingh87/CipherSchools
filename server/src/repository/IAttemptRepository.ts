import { Attempt } from '../domain/entities/Attempt.js';

export interface IAttemptRepository {
  findById(id: string): Promise<Attempt | undefined>;
  findByProblemId(problemId: string): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<void>;
  getNextVersion(problemId: string): Promise<number>;
}
