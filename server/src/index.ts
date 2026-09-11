import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ProblemRepository } from './repository/ProblemRepository.js';
import { AttemptRepository } from './repository/AttemptRepository.js';
import { PracticeService } from './services/PracticeService.js';
import { createApiRouter } from './api/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Initialize Domain Repositories & Services
const problemRepo = new ProblemRepository();
const attemptRepo = new AttemptRepository();
const practiceService = new PracticeService(problemRepo, attemptRepo);

// Routes
app.use('/api', createApiRouter(practiceService));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LLD Practice Platform Backend', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 LLD Practice Platform Server running on http://localhost:${PORT}`);
  console.log(`📚 Initialized with 4 canonical LLD seed problems.`);
});

export { app, practiceService, problemRepo, attemptRepo };
