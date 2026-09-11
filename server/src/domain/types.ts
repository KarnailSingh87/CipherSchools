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

export type EvaluatorMode = 
  | 'HYBRID_LLM'
  | 'DETERMINISTIC_HEURISTIC'
  | 'FALLBACK_HEURISTIC';

export interface RubricCriterion {
  category: RubricCategory;
  title: string;
  weight: number; // percentage, e.g. 25
  description: string;
}

export interface RubricScore {
  category: RubricCategory;
  score: number; // 0 to 100
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
  overallScore: number; // 0 to 100
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  evaluatedBy: EvaluatorMode;
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

export interface SubmissionPayload {
  code: string;
  language: 'typescript' | 'python' | 'java';
  rationale?: string;
  walkthrough?: string;
}

export interface BenchmarkSolution {
  id: string;
  title: string;
  description: string;
  level: 'BEGINNER_FLAWED' | 'SENIOR_CLEAN';
  code: string;
  rationale: string;
}

export interface ParsedClass {
  name: string;
  isInterface: boolean;
  isAbstract: boolean;
  extendsClass?: string;
  implementsInterfaces: string[];
  methods: {
    name: string;
    visibility: 'public' | 'private' | 'protected';
    params: string[];
    returnType?: string;
    line: number;
    instantiatedClasses: string[]; // classes instantiated with `new`
  }[];
  fields: {
    name: string;
    visibility: 'public' | 'private' | 'protected';
    type?: string;
  }[];
  lineCount: number;
}

export interface ParsedAst {
  classes: ParsedClass[];
  interfaces: ParsedClass[];
  totalLines: number;
  allClassNames: string[];
  allInterfaceNames: string[];
  godClasses: string[]; // classes with > 6 methods
  tightlyCoupledPairs: { fromClass: string; toClass: string }[];
}
