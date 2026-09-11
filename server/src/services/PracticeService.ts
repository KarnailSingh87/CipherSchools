import { IProblemRepository } from '../repository/IProblemRepository.js';
import { IAttemptRepository } from '../repository/IAttemptRepository.js';
import { EvaluationPipeline } from '../domain/pipeline/EvaluationPipeline.js';
import { Attempt } from '../domain/entities/Attempt.js';
import { Problem } from '../domain/entities/Problem.js';
import { SubmissionPayload } from '../domain/types.js';

export class PracticeService {
  private pipeline = new EvaluationPipeline();

  constructor(
    private problemRepo: IProblemRepository,
    private attemptRepo: IAttemptRepository
  ) {}

  async listProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  async getProblem(slugOrId: string): Promise<Problem | undefined> {
    const bySlug = await this.problemRepo.findBySlug(slugOrId);
    if (bySlug) return bySlug;
    return this.problemRepo.findById(slugOrId);
  }

  async createAndEvaluateAttempt(
    problemSlug: string,
    submission: SubmissionPayload
  ): Promise<Attempt> {
    const problem = await this.getProblem(problemSlug);
    if (!problem) {
      throw new Error(`Problem not found: ${problemSlug}`);
    }

    const version = await this.attemptRepo.getNextVersion(problem.id);
    const attemptId = `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const attempt = new Attempt({
      id: attemptId,
      problemId: problem.id,
      version,
      submission,
      status: 'PENDING'
    });

    await this.attemptRepo.save(attempt);

    // Asynchronous background evaluation (in-process worker)
    this.runBackgroundEvaluation(attempt, problem);

    return attempt;
  }

  private async runBackgroundEvaluation(attempt: Attempt, problem: Problem): Promise<void> {
    try {
      attempt.updateStatus('VALIDATING');
      await this.attemptRepo.save(attempt);

      // Brief pause to allow UI stepper to render progression smoothly
      await new Promise(resolve => setTimeout(resolve, 300));

      attempt.updateStatus('ANALYZING');
      await this.attemptRepo.save(attempt);

      await new Promise(resolve => setTimeout(resolve, 300));

      attempt.updateStatus('SYNTHESIZING');
      await this.attemptRepo.save(attempt);

      const result = await this.pipeline.execute(attempt.submission, problem);
      attempt.complete(result);
      await this.attemptRepo.save(attempt);
    } catch (err: any) {
      attempt.fail(err.message || 'Evaluation encountered an internal error.');
      await this.attemptRepo.save(attempt);
    }
  }

  async getAttempt(attemptId: string): Promise<Attempt | undefined> {
    return this.attemptRepo.findById(attemptId);
  }

  async getProblemAttempts(problemSlugOrId: string): Promise<Attempt[]> {
    const problem = await this.getProblem(problemSlugOrId);
    if (!problem) return [];
    return this.attemptRepo.findByProblemId(problem.id);
  }
}
