import { IEvaluationStrategy, StrategyResult } from './IEvaluationStrategy.js';
import { Problem } from '../entities/Problem.js';
import { SubmissionPayload, ParsedAst } from '../types.js';

export class SemanticEvaluator implements IEvaluationStrategy {
  readonly name = 'SemanticEvaluator';
  private geminiKey?: string;
  private openAiKey?: string;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openAiKey = process.env.OPENAI_API_KEY;
  }

  async evaluate(
    submission: SubmissionPayload,
    problem: Problem,
    parsedAst: ParsedAst
  ): Promise<StrategyResult> {
    if (!this.geminiKey && !this.openAiKey) {
      throw new Error('NO_API_KEY_CONFIGURED');
    }

    // Strict 7-second timeout for the external AI call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const prompt = `You are a Senior Staff Software Architect evaluating an LLD machine coding interview submission.
Problem: ${problem.title}
Requirements: ${problem.requirements.join('; ')}
Expected Domain Entities: ${problem.expectedDomainEntities.join(', ')}

Learner Rationale & Assumptions:
${submission.rationale || 'None provided'}

Learner Code:
${submission.code}

Evaluate this solution. Return ONLY a valid JSON object matching this schema:
{
  "summary": "2-3 sentences of senior-level architectural critique and strengths",
  "whatIfChallenges": [
    "3 challenging downstream requirement changes that test the flexibility of this design"
  ],
  "detectedPatterns": ["List of GOF design patterns detected in the code"]
}`;

      let jsonResponse: any = null;

      if (this.geminiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}`);
        const data: any = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) jsonResponse = JSON.parse(text);
      } else if (this.openAiKey) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openAiKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          })
        });

        if (!res.ok) throw new Error(`OpenAI API HTTP ${res.status}`);
        const data: any = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) jsonResponse = JSON.parse(text);
      }

      clearTimeout(timeout);

      if (!jsonResponse || !jsonResponse.summary) {
        throw new Error('INVALID_AI_RESPONSE');
      }

      return {
        strategyName: this.name,
        rubricScores: [],
        feedbackItems: [],
        summaryContribution: jsonResponse.summary,
        whatIfChallenges: jsonResponse.whatIfChallenges || [],
        detectedPatterns: jsonResponse.detectedPatterns || []
      };
    } catch (err: any) {
      clearTimeout(timeout);
      throw err; // Handled by EvaluationPipeline fallback
    }
  }
}
