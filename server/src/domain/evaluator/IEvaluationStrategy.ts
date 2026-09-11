import { Problem } from '../entities/Problem.js';
import { SubmissionPayload, ParsedAst, RubricScore, FeedbackItem } from '../types.js';

export interface StrategyResult {
  strategyName: string;
  rubricScores: RubricScore[];
  feedbackItems: FeedbackItem[];
  detectedPatterns?: string[];
  detectedAntiPatterns?: string[];
  whatIfChallenges?: string[];
  summaryContribution?: string;
  solidAssessments?: {
    principle: 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP';
    name: string;
    passed: boolean;
    explanation: string;
  }[];
}

export interface IEvaluationStrategy {
  readonly name: string;
  evaluate(
    submission: SubmissionPayload,
    problem: Problem,
    parsedAst: ParsedAst
  ): Promise<StrategyResult>;
}
