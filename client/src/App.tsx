import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { ProblemList } from './components/ProblemList.js';
import { ProblemWorkspace } from './components/ProblemWorkspace.js';
import { apiClient } from './api/client.js';
import { ProblemSummary, ProblemDetail } from './types.js';

export const App: React.FC = () => {
  const [view, setView] = useState<'catalog' | 'workspace' | 'history'>('catalog');
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetail | null>(null);
  const [loadingProblems, setLoadingProblems] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoadingProblems(true);
    try {
      const list = await apiClient.getProblems();
      setProblems(list);
    } catch (err) {
      console.error('Failed to load problems catalog', err);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleSelectProblem = async (slug: string) => {
    setLoadingDetail(true);
    try {
      const detail = await apiClient.getProblem(slug);
      setSelectedProblem(detail);
      setView('workspace');
    } catch (err) {
      console.error('Failed to load problem detail', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        currentView={view}
        onNavigate={(newView) => setView(newView)}
        selectedProblemTitle={selectedProblem?.title}
      />

      <main className="main-content">
        {view === 'catalog' && (
          <ProblemList
            problems={problems}
            onSelectProblem={handleSelectProblem}
            loading={loadingProblems}
          />
        )}

        {view === 'workspace' && selectedProblem && (
          <ProblemWorkspace
            problem={selectedProblem}
            onBackToCatalog={() => setView('catalog')}
          />
        )}

        {loadingDetail && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner-glow" />
            <p style={{ color: 'var(--text-muted)' }}>Loading problem workspace...</p>
          </div>
        )}
      </main>
    </div>
  );
};
