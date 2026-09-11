import { Router, Request, Response } from 'express';
import { PracticeService } from '../services/PracticeService.js';

export function createApiRouter(practiceService: PracticeService): Router {
  const router = Router();

  // 1. List all problems
  router.get('/problems', async (req: Request, res: Response) => {
    try {
      const problems = await practiceService.listProblems();
      const summaries = problems.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags,
        summary: p.summary,
        rubricsCount: p.rubrics.length
      }));
      res.json({ success: true, data: summaries });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get specific problem by slug or ID
  router.get('/problems/:slug', async (req: Request, res: Response) => {
    try {
      const problem = await practiceService.getProblem(req.params.slug);
      if (!problem) {
        return res.status(404).json({ success: false, error: 'Problem not found' });
      }
      res.json({ success: true, data: problem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Submit an attempt for a problem
  router.post('/problems/:slug/attempts', async (req: Request, res: Response) => {
    try {
      const { code, language = 'typescript', rationale = '', walkthrough = '' } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, error: 'Code is required' });
      }

      const attempt = await practiceService.createAndEvaluateAttempt(req.params.slug, {
        code,
        language,
        rationale,
        walkthrough
      });

      res.status(202).json({
        success: true,
        data: attempt.toJSON()
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 4. Poll/Get attempt status and result by ID
  router.get('/attempts/:id', async (req: Request, res: Response) => {
    try {
      const attempt = await practiceService.getAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ success: false, error: 'Attempt not found' });
      }
      res.json({ success: true, data: attempt.toJSON() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Get attempt history for a problem
  router.get('/problems/:slug/attempts', async (req: Request, res: Response) => {
    try {
      const attempts = await practiceService.getProblemAttempts(req.params.slug);
      res.json({
        success: true,
        data: attempts.map(a => a.toJSON())
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
