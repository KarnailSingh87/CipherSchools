import React from 'react';
import { Attempt } from '../types.js';
import { History, RotateCcw } from 'lucide-react';

interface AttemptHistoryProps {
  attempts: Attempt[];
  onSelectAttempt: (attempt: Attempt) => void;
  onRestoreCode: (code: string, rationale?: string) => void;
  currentAttemptId?: string;
}

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
  attempts,
  onSelectAttempt,
  onRestoreCode,
  currentAttemptId
}) => {

  if (attempts.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <History size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <h4 style={{ color: 'white', marginBottom: '6px' }}>No Previous Attempts Yet</h4>
        <p style={{ fontSize: '0.86rem' }}>Submit your first solution to begin tracking your design progression.</p>
      </div>
    );
  }

  const sorted = [...attempts].sort((a, b) => b.version - a.version);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>
            Attempt Progression History
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Review past iterations, score growth, and inspect how your design evolved
          </p>
        </div>
        <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
          {attempts.length} Iteration{attempts.length > 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.map(att => {
          const isSelected = att.id === currentAttemptId;
          const score = att.result?.overallScore;
          const grade = att.result?.overallGrade;

          return (
            <div 
              key={att.id} 
              className="attempt-row" 
              style={{ 
                borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                background: isSelected ? 'rgba(99, 102, 241, 0.08)' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.06)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: isSelected ? '#a5b4fc' : 'white'
                }}>
                  v{att.version}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'white' }}>
                      Attempt #{att.version}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                    <span>{att.submission.code.split('\n').length} lines of code</span>
                    <span>{att.result?.feedbackItems.length || 0} critiques</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {score !== undefined ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {score}% ({grade})
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Processing</span>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.76rem', padding: '6px 10px' }}
                    onClick={() => onSelectAttempt(att)}
                    title="View this attempt's feedback"
                  >
                    View Feedback
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.76rem', padding: '6px 10px' }}
                    onClick={() => onRestoreCode(att.submission.code, att.submission.rationale)}
                    title="Restore this code into the editor"
                  >
                    <RotateCcw size={12} />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
