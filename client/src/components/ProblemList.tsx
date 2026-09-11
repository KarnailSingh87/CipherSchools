import React from 'react';
import { ProblemSummary } from '../types.js';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProblemListProps {
  problems: ProblemSummary[];
  onSelectProblem: (slug: string) => void;
  loading: boolean;
}

export const ProblemList: React.FC<ProblemListProps> = ({ problems, onSelectProblem, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className="spinner-glow" />
        <p style={{ color: 'var(--text-muted)' }}>Loading canonical LLD problems...</p>
      </div>
    );
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return <span className="badge badge-easy">EASY</span>;
      case 'MEDIUM':
        return <span className="badge badge-medium">MEDIUM</span>;
      case 'HARD':
        return <span className="badge badge-hard">HARD</span>;
      default:
        return <span className="badge">{difficulty}</span>;
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08))', 
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        marginBottom: '36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px' }}>
            <Sparkles size={14} /> The Practice Loop: Choose → Think → Submit → Explainable Feedback → Refine
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '12px' }}>
            Master Object-Oriented Low-Level Design
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Unlike DSA, LLD has no single binary pass/fail answer. Practice real-world domain decomposition, test against SOLID rubrics, receive explainable AI architectural critique, and stress-test your abstractions with dynamic "What-If" scenarios.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#10b981" /> 4 Canonical Machine Coding Problems
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#10b981" /> Real-Time Live Class Diagram Preview
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#10b981" /> Built-in Flawed vs Senior Benchmarks
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>Curated Problem Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select a problem to enter the practice studio</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Showing {problems.length} problems
        </div>
      </div>

      <div className="problems-grid">
        {problems.map(problem => (
          <div key={problem.id} className="card card-interactive problem-card" onClick={() => onSelectProblem(problem.slug)}>
            <div className="problem-header">
              <div style={{ flex: 1 }}>
                <h3 className="problem-title">{problem.title}</h3>
              </div>
              {getDifficultyBadge(problem.difficulty)}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', flex: 1, lineHeight: 1.5 }}>
              {problem.summary}
            </p>

            <div className="tags-row">
              {problem.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {problem.rubricsCount} Evaluation Rubrics
              </span>
              <button 
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProblem(problem.slug);
                }}
              >
                <span>Start Practice</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
