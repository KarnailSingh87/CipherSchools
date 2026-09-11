import { Problem } from '../domain/entities/Problem.js';

export interface IProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | undefined>;
  findBySlug(slug: string): Promise<Problem | undefined>;
  save(problem: Problem): Promise<void>;
}
