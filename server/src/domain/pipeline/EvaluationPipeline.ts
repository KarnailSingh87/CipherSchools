import { Problem } from '../entities/Problem.js';
import { AstParser } from '../evaluator/AstParser.js';
import { StructuralEvaluator } from '../evaluator/StructuralEvaluator.js';
import { SolidEvaluator } from '../evaluator/SolidEvaluator.js';
import { SemanticEvaluator } from '../evaluator/SemanticEvaluator.js';
import { FallbackEvaluator } from '../evaluator/FallbackEvaluator.js';
import { 
  SubmissionPayload, 
  EvaluationResult, 
  EvaluatorMode, 
  RubricScore, 
  FeedbackItem 
} from '../types.js';

export class EvaluationPipeline {
  private structuralEvaluator = new StructuralEvaluator();
  private solidEvaluator = new SolidEvaluator();
  private semanticEvaluator = new SemanticEvaluator();

  /**
   * Executes the full evaluation pipeline across deterministic and semantic layers.
   */
  async execute(submission: SubmissionPayload, problem: Problem): Promise<EvaluationResult> {
    const startTime = Date.now();

    // 1. Validation Stage
    if (!submission.code || submission.code.trim().length === 0) {
      throw new Error('SUBMISSION_EMPTY_CODE: Submission must contain source code.');
    }

    // 2. AST / Structural Parsing
    const parsedAst = AstParser.parse(submission.code);

    // 3. Deterministic Evaluators
    const structuralResult = await this.structuralEvaluator.evaluate(submission, problem, parsedAst);
    const solidResult = await this.solidEvaluator.evaluate(submission, problem, parsedAst);

    // Combine Rubrics from deterministic evaluators
    const rubricScores: RubricScore[] = [
      ...structuralResult.rubricScores,
      ...solidResult.rubricScores
    ];

    // Consolidate Feedback Items
    const feedbackItems: FeedbackItem[] = [
      ...structuralResult.feedbackItems,
      ...solidResult.feedbackItems
    ];

    const detectedPatterns = Array.from(new Set([
      ...(structuralResult.detectedPatterns || []),
      ...(solidResult.detectedPatterns || [])
    ]));

    const detectedAntiPatterns = Array.from(new Set([
      ...(structuralResult.detectedAntiPatterns || []),
      ...(solidResult.detectedAntiPatterns || [])
    ]));

    // 4. Calculate Overall Weighted Score
    let totalScore = 0;
    let totalWeight = 0;
    for (const r of rubricScores) {
      totalScore += (r.score * r.weight);
      totalWeight += r.weight;
    }
    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;

    let overallGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (overallScore >= 85) overallGrade = 'A';
    else if (overallScore >= 70) overallGrade = 'B';
    else if (overallScore >= 55) overallGrade = 'C';
    else if (overallScore >= 40) overallGrade = 'D';
    else overallGrade = 'F';

    // 5. Semantic / AI Stage with Resilient Fallback
    let evaluatedBy: EvaluatorMode = 'DETERMINISTIC_HEURISTIC';
    let summary = '';
    let whatIfChallenges: string[] = [];

    try {
      const semanticResult = await this.semanticEvaluator.evaluate(submission, problem, parsedAst);
      evaluatedBy = 'HYBRID_LLM';
      if (semanticResult.summaryContribution) summary = semanticResult.summaryContribution;
      if (semanticResult.whatIfChallenges) whatIfChallenges = semanticResult.whatIfChallenges;
    } catch {
      // Fallback is expected when offline or unconfigured
      evaluatedBy = 'FALLBACK_HEURISTIC';
      const insights = FallbackEvaluator.generateInsights(submission, problem, parsedAst, overallScore);
      summary = insights.summary;
      whatIfChallenges = insights.whatIfChallenges;
    }

    const durationMs = Date.now() - startTime;

    return {
      overallScore,
      overallGrade,
      evaluatedBy,
      evaluatedAt: new Date().toISOString(),
      durationMs,
      summary,
      rubricScores,
      feedbackItems,
      detectedPatterns,
      detectedAntiPatterns,
      whatIfChallenges,
      solidChecklist: solidResult.solidAssessments || []
    };
  }
}
