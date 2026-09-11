import React, { useState } from 'react';
import { EvaluationResult, Severity } from '../types.js';
import { 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ShieldCheck,
  Zap,
  Repeat
} from 'lucide-react';

interface FeedbackReportProps {
  result: EvaluationResult;
  version: number;
  onTryAgain: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({ result, version, onTryAgain }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--status-success)';
    if (score >= 60) return 'var(--status-warning)';
    return 'var(--status-critical)';
  };

  const filteredFeedback = selectedSeverity === 'ALL'
    ? result.feedbackItems
    : result.feedbackItems.filter(f => f.severity === selectedSeverity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(15, 20, 34, 0.95))',
        border: '1px solid var(--border-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                Attempt #{version} Feedback
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Evaluated in {result.durationMs}ms via {result.evaluatedBy}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
              Architectural Evaluation Report
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Grade
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: getScoreColor(result.overallScore), lineHeight: 1 }}>
                {result.overallGrade}
              </div>
            </div>

            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: `conic-gradient(${getScoreColor(result.overallScore)} ${result.overallScore}%, rgba(255,255,255,0.05) 0)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px rgba(99,102,241,0.2)`
            }}>
              <div style={{ 
                width: '66px', 
                height: '66px', 
                borderRadius: '50%', 
                background: '#0d121e', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{result.overallScore}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>/ 100</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={onTryAgain} style={{ padding: '10px 18px' }}>
              <Repeat size={16} />
              <span>Refine Solution</span>
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ 
          marginTop: '20px', 
          padding: '16px 20px', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(255, 255, 255, 0.03)',
          borderLeft: '4px solid var(--accent-primary)',
          fontSize: '0.92rem',
          lineHeight: 1.6,
          color: '#e2e8f0'
        }}>
          {result.summary}
        </div>
      </div>

      {/* 4-Pillar Rubric Breakdown */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
          Rubric Performance Breakdown
        </h3>
        <div className="rubric-grid">
          {result.rubricScores.map(rubric => (
            <div key={rubric.category} className="rubric-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>
                  {rubric.category}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: getScoreColor(rubric.score) }}>
                  {rubric.score}% ({rubric.grade})
                </span>
              </div>

              <div className="progress-track">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${rubric.score}%`, 
                    backgroundColor: getScoreColor(rubric.score) 
                  }} 
                />
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {rubric.summary}
              </p>

              {/* Checklist items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {rubric.checklist.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem' }}>
                    {item.passed ? (
                      <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <XCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div>
                      <span style={{ color: item.passed ? '#cbd5e1' : '#f87171' }}>{item.item}</span>
                      {item.note && <div style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>{item.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOLID Principles Radar Matrix */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ShieldCheck size={20} color="#6366f1" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>
            SOLID Principles Compliance
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {result.solidChecklist.map(s => (
            <div key={s.principle} style={{ 
              padding: '12px 14px', 
              borderRadius: 'var(--radius-md)', 
              background: s.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${s.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: s.passed ? '#34d399' : '#f87171' }}>
                  {s.principle}
                </span>
                <span className={`badge ${s.passed ? 'badge-easy' : 'badge-hard'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                  {s.passed ? 'PASSED' : 'NEEDS WORK'}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{s.name}</div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Itemized Feedback & Concrete Refactoring Nudges */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>
              Architectural Critiques & Refactoring Nudges
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Actionable advice to elevate your design to senior staff level
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {(['ALL', 'CRITICAL', 'WARNING', 'SUGGESTION', 'PRAISE'] as const).map(sev => (
              <button
                key={sev}
                className={`btn btn-secondary ${selectedSeverity === sev ? 'active' : ''}`}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '4px 10px',
                  background: selectedSeverity === sev ? 'rgba(99,102,241,0.25)' : undefined 
                }}
                onClick={() => setSelectedSeverity(sev)}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>No feedback items for the selected filter.</p>
        ) : (
          filteredFeedback.map(item => (
            <div 
              key={item.id} 
              className={`feedback-card ${
                item.severity === 'CRITICAL' ? 'feedback-critical' :
                item.severity === 'WARNING' ? 'feedback-warning' :
                item.severity === 'PRAISE' ? 'feedback-praise' : 'feedback-suggestion'
              }`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'white' }}>
                  {item.title}
                </span>
                <span className="badge" style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)' }}>
                  {item.category}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {item.message}
              </p>

              {item.refactoringNudge && (
                <div className="nudge-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 600, fontSize: '0.78rem', marginBottom: '2px' }}>
                    <Lightbulb size={14} /> Refactoring Nudge:
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>
                    {item.refactoringNudge}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* "What-If" Architectural Challenges */}
      {result.whatIfChallenges && result.whatIfChallenges.length > 0 && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(99, 102, 241, 0.08))', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>
              Architectural "What-If" Stress Tests
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Great LLD interviews test adaptability when requirements mutate. How does your design respond to these downstream challenges?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.whatIfChallenges.map((challenge, idx) => (
              <div key={idx} style={{ 
                padding: '12px 16px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(0, 0, 0, 0.25)', 
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: 'rgba(6, 182, 212, 0.2)', 
                  color: '#06b6d4', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {challenge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
