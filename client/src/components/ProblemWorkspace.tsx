import React, { useState, useEffect } from 'react';
import { ProblemDetail, Attempt, BenchmarkSolution } from '../types.js';
import { CodeEditor } from './CodeEditor.js';
import { FeedbackReport } from './FeedbackReport.js';
import { AttemptHistory } from './AttemptHistory.js';
import { apiClient } from '../api/client.js';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Code2, 
  History, 
  Award,
  AlertCircle
} from 'lucide-react';

interface ProblemWorkspaceProps {
  problem: ProblemDetail;
  onBackToCatalog: () => void;
}

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({ problem, onBackToCatalog }) => {
  const [code, setCode] = useState<string>(problem.starterCode.typescript);
  const [rationale, setRationale] = useState<string>(problem.starterRationale);
  const [activeRightTab, setActiveRightTab] = useState<'editor' | 'feedback' | 'history'>('editor');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [evaluatingModal, setEvaluatingModal] = useState<boolean>(false);
  const [evaluationStage, setEvaluationStage] = useState<string>('Validating structural contracts...');
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [history, setHistory] = useState<Attempt[]>([]);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Load attempt history on mount
  useEffect(() => {
    loadHistory();
  }, [problem.slug]);

  const loadHistory = async () => {
    try {
      const attempts = await apiClient.getProblemAttempts(problem.slug);
      setHistory(attempts);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const handleResetStarter = () => {
    if (window.confirm('Reset code and rationale to the initial template?')) {
      setCode(problem.starterCode.typescript);
      setRationale(problem.starterRationale);
    }
  };

  const handleLoadBenchmark = (b: BenchmarkSolution) => {
    setCode(b.code);
    setRationale(b.rationale);
    setErrorNotice(null);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setEvaluatingModal(true);
    setErrorNotice(null);
    setEvaluationStage('Step 1/3: Analyzing AST & Entity Contracts...');

    try {
      const initialAttempt = await apiClient.submitAttempt(problem.slug, {
        code,
        language: 'typescript',
        rationale
      });

      // Polling loop for async background worker
      let pollCount = 0;
      const interval = setInterval(async () => {
        pollCount++;
        if (pollCount === 2) {
          setEvaluationStage('Step 2/3: Inspecting SOLID Principles & Couplings...');
        } else if (pollCount === 4) {
          setEvaluationStage('Step 3/3: Synthesizing Explainable Architectural Feedback...');
        }

        try {
          const updated = await apiClient.getAttempt(initialAttempt.id);
          if (updated.status === 'COMPLETED') {
            clearInterval(interval);
            setCurrentAttempt(updated);
            setSubmitting(false);
            setEvaluatingModal(false);
            setActiveRightTab('feedback');
            loadHistory();

            // Confetti for score >= 85
            if (updated.result && updated.result.overallScore >= 80) {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            }
          } else if (updated.status === 'FAILED') {
            clearInterval(interval);
            setSubmitting(false);
            setEvaluatingModal(false);
            setErrorNotice(updated.error || 'Evaluation failed. Please review your code.');
          }
        } catch (pollErr) {
          clearInterval(interval);
          setSubmitting(false);
          setEvaluatingModal(false);
          setErrorNotice('Failed to communicate with evaluation engine.');
        }
      }, 500);

    } catch (err: any) {
      setSubmitting(false);
      setEvaluatingModal(false);
      setErrorNotice(err.message || 'Submission error');
    }
  };

  return (
    <div className="workspace-container">
      {/* LEFT PANE: Problem Specification, Requirements & Rubric */}
      <div className="workspace-left-pane">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className={`badge ${
              problem.difficulty === 'EASY' ? 'badge-easy' :
              problem.difficulty === 'MEDIUM' ? 'badge-medium' : 'badge-hard'
            }`}>
              {problem.difficulty}
            </span>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              onClick={onBackToCatalog}
            >
              ← Catalog
            </button>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
            {problem.title}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
            {problem.description}
          </p>

          {/* Functional Requirements */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10b981" /> Functional Requirements
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {problem.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Non-Functional Constraints */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} color="#f59e0b" /> Architectural Constraints
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Expected Domain Nouns / Entities */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
              Expected Domain Entities:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {problem.expectedDomainEntities.map(noun => (
                <span key={noun} className="tag" style={{ border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                  {noun}
                </span>
              ))}
            </div>
          </div>

          {/* Rubric Overview */}
          <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
              Evaluation Weighting
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {problem.rubrics.map(r => (
                <div key={r.category} style={{ fontSize: '0.76rem', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 600, color: 'white' }}>{r.category} ({r.weight}%)</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>{r.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Workspace (Editor / Feedback / History) */}
      <div className="workspace-right-pane">
        {/* Navigation Tabs between Editor, Feedback, and History */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="tab-bar">
            <button 
              className={`tab-btn ${activeRightTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('editor')}
            >
              <Code2 size={16} />
              <span>Design Studio</span>
            </button>

            <button 
              className={`tab-btn ${activeRightTab === 'feedback' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('feedback')}
              disabled={!currentAttempt}
            >
              <Award size={16} />
              <span>Feedback Report {currentAttempt ? `(#${currentAttempt.version})` : ''}</span>
            </button>

            <button 
              className={`tab-btn ${activeRightTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('history')}
            >
              <History size={16} />
              <span>Attempt History ({history.length})</span>
            </button>
          </div>
        </div>

        {errorNotice && (
          <div style={{ padding: '10px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '0.85rem' }}>
            {errorNotice}
          </div>
        )}

        {/* Tab 1: Studio Editor */}
        {activeRightTab === 'editor' && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CodeEditor
              code={code}
              onChangeCode={setCode}
              rationale={rationale}
              onChangeRationale={setRationale}
              onResetStarter={handleResetStarter}
              benchmarks={problem.benchmarks}
              onLoadBenchmark={handleLoadBenchmark}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        )}

        {/* Tab 2: Feedback Report */}
        {activeRightTab === 'feedback' && currentAttempt?.result && (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
            <FeedbackReport
              result={currentAttempt.result}
              version={currentAttempt.version}
              onTryAgain={() => setActiveRightTab('editor')}
            />
          </div>
        )}

        {/* Tab 3: History */}
        {activeRightTab === 'history' && (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
            <AttemptHistory
              attempts={history}
              currentAttemptId={currentAttempt?.id}
              onSelectAttempt={(att) => {
                setCurrentAttempt(att);
                setActiveRightTab('feedback');
              }}
              onRestoreCode={(restoredCode, restoredRationale) => {
                setCode(restoredCode);
                if (restoredRationale) setRationale(restoredRationale);
                setActiveRightTab('editor');
              }}
            />
          </div>
        )}
      </div>

      {/* Evaluating Modal */}
      {evaluatingModal && (
        <div className="evaluation-modal">
          <div className="modal-content">
            <div className="spinner-glow" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              Architectural Review in Progress
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
              The evaluation engine is inspecting your class boundaries, abstractions, and SOLID principles.
            </p>

            <div style={{ 
              padding: '12px 18px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              border: '1px solid rgba(99, 102, 241, 0.25)', 
              borderRadius: 'var(--radius-md)',
              color: '#a5b4fc',
              fontSize: '0.88rem',
              fontWeight: 600
            }}>
              {evaluationStage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
