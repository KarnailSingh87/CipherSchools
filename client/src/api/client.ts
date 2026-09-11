import { ProblemSummary, ProblemDetail, Attempt } from '../types.js';

const API_BASE = '/api';

export const apiClient = {
  async getProblems(): Promise<ProblemSummary[]> {
    const res = await fetch(`${API_BASE}/problems`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch problems');
    return data.data;
  },

  async getProblem(slug: string): Promise<ProblemDetail> {
    const res = await fetch(`${API_BASE}/problems/${slug}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch problem');
    return data.data;
  },

  async submitAttempt(
    slug: string, 
    payload: { code: string; language: string; rationale?: string; walkthrough?: string }
  ): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/problems/${slug}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to submit attempt');
    return data.data;
  },

  async getAttempt(id: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to poll attempt');
    return data.data;
  },

  async getProblemAttempts(slug: string): Promise<Attempt[]> {
    const res = await fetch(`${API_BASE}/problems/${slug}/attempts`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch attempt history');
    return data.data;
  }
};
