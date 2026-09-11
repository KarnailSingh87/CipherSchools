import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, BookOpen, FileCode, Layers } from 'lucide-react';
import { ClassDiagram } from './ClassDiagram.js';
import { BenchmarkSolution } from '../types.js';

interface CodeEditorProps {
  code: string;
  onChangeCode: (code: string) => void;
  rationale: string;
  onChangeRationale: (rationale: string) => void;
  onResetStarter: () => void;
  benchmarks: BenchmarkSolution[];
  onLoadBenchmark: (benchmark: BenchmarkSolution) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  rationale,
  onChangeRationale,
  onResetStarter,
  benchmarks,
  onLoadBenchmark,
  onSubmit,
  submitting
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'rationale' | 'diagram'>('code');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Action Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div className="tab-bar" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <button 
            className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <FileCode size={16} />
            <span>Domain Code</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rationale' ? 'active' : ''}`}
            onClick={() => setActiveTab('rationale')}
          >
            <BookOpen size={16} />
            <span>Design Rationale</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            <Layers size={16} />
            <span>Live UML Diagram</span>
          </button>
        </div>

        {/* Benchmark Quick-Loaders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {benchmarks.map(b => (
            <button
              key={b.id}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
              onClick={() => onLoadBenchmark(b)}
              title={b.description}
            >
              <Sparkles size={13} color={b.level === 'SENIOR_CLEAN' ? '#10b981' : '#f59e0b'} />
              <span>Load {b.level === 'SENIOR_CLEAN' ? 'Senior Model' : 'Flawed Model'}</span>
            </button>
          ))}
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            onClick={onResetStarter}
            title="Reset code to initial blank template"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="editor-wrapper">
        <div className="editor-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {activeTab === 'code' ? 'TypeScript / OOP' : activeTab === 'rationale' ? 'Markdown Notes' : 'Live Class Hierarchy'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {code.split('\n').length} lines
            </span>
            <button
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={onSubmit}
              disabled={submitting || !code.trim()}
            >
              <Play size={14} />
              <span>{submitting ? 'Evaluating...' : 'Submit Solution'}</span>
            </button>
          </div>
        </div>

        {activeTab === 'code' && (
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            placeholder="// Define classes, interfaces, methods, and relationships here..."
            spellCheck={false}
          />
        )}

        {activeTab === 'rationale' && (
          <textarea
            className="code-textarea"
            value={rationale}
            onChange={(e) => onChangeRationale(e.target.value)}
            placeholder="Document your design assumptions, pattern choices, and concurrency trade-offs here..."
            spellCheck={false}
          />
        )}

        {activeTab === 'diagram' && (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            <ClassDiagram code={code} />
          </div>
        )}
      </div>
    </div>
  );
};
