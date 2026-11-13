import type { DashboardMetrics } from '../types';

export interface UserPracticeData {
  totalInterviews: number;
  interviewScores: number[];
  averageScore: number;
  latestAtsScore: number;
  codingChallengesCompleted: number;
  solvedProblemIds: string[];
  domainScores: Record<string, number>;
  domainScoresHistory: Record<string, number[]>;
  recentActivity: Array<{
    type: 'MOCK_INTERVIEW' | 'RESUME_ATS' | 'CODING_CHALLENGE' | 'COMPANY_KIT';
    title: string;
    score: number;
    date: string;
  }>;
}

const DEFAULT_DOMAINS = [
  'Java Core',
  'Data Structures',
  'System Design',
  'Behavioral / HR',
  'Database & SQL'
];

function getInitialMetrics(): UserPracticeData {
  const initialDomainScores: Record<string, number> = {};
  const initialDomainHistory: Record<string, number[]> = {};

  DEFAULT_DOMAINS.forEach((domain) => {
    initialDomainScores[domain] = 0;
    initialDomainHistory[domain] = [];
  });

  return {
    totalInterviews: 0,
    interviewScores: [],
    averageScore: 0,
    latestAtsScore: 0,
    codingChallengesCompleted: 0,
    solvedProblemIds: [],
    domainScores: initialDomainScores,
    domainScoresHistory: initialDomainHistory,
    recentActivity: []
  };
}

function getCurrentUserEmail(): string {
  try {
    const raw = localStorage.getItem('current_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.email) return parsed.email.toLowerCase().trim();
    }
  } catch {
    // ignore
  }
  return 'default_user';
}

function getStorageKey(email?: string): string {
  const targetEmail = email ? email.toLowerCase().trim() : getCurrentUserEmail();
  return `user_practice_metrics_${targetEmail}`;
}

export const userPracticeStore = {
  /**
   * Reset / initialize clean metrics for a newly registered user
   */
  initializeNewUser(email: string): UserPracticeData {
    const fresh = getInitialMetrics();
    const key = getStorageKey(email);
    localStorage.setItem(key, JSON.stringify(fresh));
    // Also clear any global fallback ATS score
    localStorage.removeItem('latest_ats_score');
    localStorage.removeItem('latest_ats_analysis');
    return fresh;
  },

  /**
   * Retrieve current user's live practice metrics
   */
  getMetrics(): DashboardMetrics {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    let data: UserPracticeData;

    if (!raw) {
      data = getInitialMetrics();
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      try {
        data = JSON.parse(raw);
      } catch {
        data = getInitialMetrics();
      }
    }

    // Ensure all default domains exist
    DEFAULT_DOMAINS.forEach((domain) => {
      if (typeof data.domainScores[domain] === 'undefined') {
        data.domainScores[domain] = 0;
      }
    });

    return {
      totalInterviews: data.totalInterviews || 0,
      averageScore: data.averageScore || 0,
      latestAtsScore: data.latestAtsScore || 0,
      codingChallengesCompleted: data.codingChallengesCompleted || 0,
      domainScores: data.domainScores,
      recentActivity: data.recentActivity || []
    };
  },

  /**
   * Record a completed mock interview answer or session
   */
  recordInterview(domain: string, score: number, title?: string) {
    const key = getStorageKey();
    const data: UserPracticeData = { ...getInitialMetrics(), ...this.getRawData() };

    data.totalInterviews += 1;
    data.interviewScores = data.interviewScores || [];
    data.interviewScores.push(score);

    const sum = data.interviewScores.reduce((acc, curr) => acc + curr, 0);
    data.averageScore = Math.round((sum / data.interviewScores.length) * 10) / 10;

    // Map domain to domain category
    let targetDomain = 'Java Core';
    const upper = (domain || '').toUpperCase();
    if (upper.includes('JAVA')) targetDomain = 'Java Core';
    else if (upper.includes('DSA') || upper.includes('ALGO') || upper.includes('STRUCTURE')) targetDomain = 'Data Structures';
    else if (upper.includes('DESIGN') || upper.includes('SYSTEM')) targetDomain = 'System Design';
    else if (upper.includes('BEHAVIORAL') || upper.includes('HR')) targetDomain = 'Behavioral / HR';
    else if (upper.includes('SQL') || upper.includes('DATABASE')) targetDomain = 'Database & SQL';

    data.domainScoresHistory = data.domainScoresHistory || {};
    data.domainScoresHistory[targetDomain] = data.domainScoresHistory[targetDomain] || [];
    data.domainScoresHistory[targetDomain].push(score);

    const domainSum = data.domainScoresHistory[targetDomain].reduce((a, b) => a + b, 0);
    data.domainScores[targetDomain] = Math.round(domainSum / data.domainScoresHistory[targetDomain].length);

    // Add to activity timeline
    const today = new Date().toISOString().split('T')[0];
    data.recentActivity = data.recentActivity || [];
    data.recentActivity.unshift({
      type: 'MOCK_INTERVIEW',
      title: title || `${targetDomain} Interview Question`,
      score,
      date: today
    });

    if (data.recentActivity.length > 8) {
      data.recentActivity = data.recentActivity.slice(0, 8);
    }

    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * Record a solved coding sandbox challenge
   */
  recordCodingChallenge(problemTitle: string, problemId: string) {
    const key = getStorageKey();
    const data: UserPracticeData = { ...getInitialMetrics(), ...this.getRawData() };

    data.solvedProblemIds = data.solvedProblemIds || [];
    const isNewSolve = !data.solvedProblemIds.includes(problemId);

    if (isNewSolve) {
      data.solvedProblemIds.push(problemId);
      data.codingChallengesCompleted += 1;
    }

    // Boost Data Structures competency
    const currentDSA = data.domainScores['Data Structures'] || 0;
    data.domainScores['Data Structures'] = Math.min(100, Math.max(currentDSA, data.codingChallengesCompleted * 20));

    // Add to activity timeline
    const today = new Date().toISOString().split('T')[0];
    data.recentActivity = data.recentActivity || [];
    data.recentActivity.unshift({
      type: 'CODING_CHALLENGE',
      title: problemTitle || 'Coding Sandbox Challenge',
      score: 100,
      date: today
    });

    if (data.recentActivity.length > 8) {
      data.recentActivity = data.recentActivity.slice(0, 8);
    }

    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * Record an ATS Resume Scanner run
   */
  recordAtsScan(score: number, targetRole: string) {
    const key = getStorageKey();
    const data: UserPracticeData = { ...getInitialMetrics(), ...this.getRawData() };

    data.latestAtsScore = score;
    localStorage.setItem('latest_ats_score', String(score));

    const today = new Date().toISOString().split('T')[0];
    data.recentActivity = data.recentActivity || [];
    data.recentActivity.unshift({
      type: 'RESUME_ATS',
      title: `ATS Resume Scan (${targetRole || 'SDE'})`,
      score,
      date: today
    });

    if (data.recentActivity.length > 8) {
      data.recentActivity = data.recentActivity.slice(0, 8);
    }

    localStorage.setItem(key, JSON.stringify(data));
  },

  getRawData(): UserPracticeData {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return getInitialMetrics();
    try {
      return JSON.parse(raw);
    } catch {
      return getInitialMetrics();
    }
  }
};

