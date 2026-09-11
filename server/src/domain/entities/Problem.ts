import { Difficulty, RubricCriterion, BenchmarkSolution } from '../types.js';

export interface ProblemProps {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  summary: string;
  description: string;
  requirements: string[];
  constraints: string[];
  expectedDomainEntities: string[];
  starterCode: {
    typescript: string;
    python?: string;
  };
  starterRationale: string;
  rubrics: RubricCriterion[];
  benchmarks: BenchmarkSolution[];
}

export class Problem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly tags: string[];
  readonly summary: string;
  readonly description: string;
  readonly requirements: string[];
  readonly constraints: string[];
  readonly expectedDomainEntities: string[];
  readonly starterCode: { typescript: string; python?: string };
  readonly starterRationale: string;
  readonly rubrics: RubricCriterion[];
  readonly benchmarks: BenchmarkSolution[];

  constructor(props: ProblemProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.difficulty = props.difficulty;
    this.tags = props.tags;
    this.summary = props.summary;
    this.description = props.description;
    this.requirements = props.requirements;
    this.constraints = props.constraints;
    this.expectedDomainEntities = props.expectedDomainEntities;
    this.starterCode = props.starterCode;
    this.starterRationale = props.starterRationale;
    this.rubrics = props.rubrics;
    this.benchmarks = props.benchmarks;
  }

  getBenchmark(level: 'BEGINNER_FLAWED' | 'SENIOR_CLEAN'): BenchmarkSolution | undefined {
    return this.benchmarks.find(b => b.level === level);
  }
}
