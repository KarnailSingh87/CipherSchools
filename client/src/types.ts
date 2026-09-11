export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type SubmissionStatus = 
  | 'PENDING'
  | 'VALIDATING'
  | 'ANALYZING'
  | 'SYNTHESIZING'
  | 'COMPLETED'
  | 'FAILED';

export type RubricCategory = 
  | 'REQUIREMENTS'
  | 'SOLID'
  | 'EXTENSIBILITY'
  | 'EDGE_CASES';

export type Severity = 
  | 'PRAISE'
  | 'INFO'
  | 'SUGGESTION'
  | 'WARNING'
  | 'CRITICAL';

export interface RubricCriterion {
  category: RubricCategory;
  title: string;
  weight: number;
  description: string;
}

export interface RubricScore {
  category: RubricCategory;
  score: number;
  weight: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  checklist: { item: string; passed: boolean; note?: string }[];
}

export interface FeedbackItem {
  id: string;
  category: RubricCategory;
  severity: Severity;
  title: string;
  message: string;
  codeSnippetHint?: string;
  refactoringNudge?: string;
}

export interface EvaluationResult {
  overallScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  evaluatedBy: string;
  evaluatedAt: string;
  durationMs: number;
  summary: string;
  rubricScores: RubricScore[];
  feedbackItems: FeedbackItem[];
  detectedPatterns: string[];
  detectedAntiPatterns: string[];
  whatIfChallenges: string[];
  solidChecklist: {
    principle: 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP';
    name: string;
    passed: boolean;
    explanation: string;
  }[];
}

export interface BenchmarkSolution {
  id: string;
  title: string;
  description: string;
  level: 'BEGINNER_FLAWED' | 'SENIOR_CLEAN';
  code: string;
  rationale: string;
}

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  summary: string;
  rubricsCount: number;
}

export interface ProblemDetail extends ProblemSummary {
  description: string;
  requirements: string[];
  constraints: string[];
  expectedDomainEntities: string[];
  starterCode: { typescript: string; python?: string };
  starterRationale: string;
  rubrics: RubricCriterion[];
  benchmarks: BenchmarkSolution[];
}

export interface Attempt {
  id: string;
  problemId: string;
  version: number;
  submission: {
    code: string;
    language: string;
    rationale?: string;
    walkthrough?: string;
  };
  status: SubmissionStatus;
  result?: EvaluationResult;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
