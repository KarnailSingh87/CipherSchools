import React from 'react';
import { Layers, Sparkles, BookOpen, Code2 } from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'workspace' | 'history';
  onNavigate: (view: 'catalog' | 'workspace' | 'history') => void;
  selectedProblemTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, selectedProblemTitle }) => {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => onNavigate('catalog')}>
        <div className="brand-icon">
          <Layers size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">LLD Studio</span>
            <span className="brand-badge">MVP</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Low-Level Design Practice & Feedback</p>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className={`btn ${currentView === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onNavigate('catalog')}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <BookOpen size={16} />
          <span>Problem Catalog</span>
        </button>

        {selectedProblemTitle && (
          <button 
            className={`btn ${currentView === 'workspace' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onNavigate('workspace')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Code2 size={16} />
            <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedProblemTitle}
            </span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={14} /> AI & Heuristics Ready
          </span>
        </div>
      </nav>
    </header>
  );
};
