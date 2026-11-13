import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Mic, 
  FileText, 
  Code, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2,
  Clock,
  Bot
} from 'lucide-react';
import type { DashboardMetrics } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px' }}>Loading Dashboard Metrics...</div>;
  }

  const overallReadiness = Math.round(
    (metrics.averageScore * 0.4) + (metrics.latestAtsScore * 0.4) + (Math.min(100, metrics.codingChallengesCompleted * 8) * 0.2)
  );

  return (
    <div>
      {/* Top Banner Card */}
      <div className="glass-card glass-card-glow" style={{
        padding: '32px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.15) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 600, fontSize: '0.75rem', marginBottom: '12px' }}>
            <Sparkles size={14} />
            <span>PLACEMENT READINESS ENGINE</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Overall Placement Index: <span style={{ color: '#10b981' }}>{overallReadiness}%</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px', maxWidth: '600px' }}>
            Based on AI evaluation of your recent technical sessions, ATS resume keywords, and coding sandbox performance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('ai-coding')} className="btn-primary" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #6366f1 100%)' }}>
            <Bot size={18} />
            <span>AI Assisted OA Practice</span>
          </button>
          <button onClick={() => onNavigate('interview')} className="btn-secondary">
            <Mic size={18} />
            <span>Voice Interview</span>
          </button>
          <button onClick={() => onNavigate('resume')} className="btn-secondary">
            <FileText size={18} />
            <span>ATS Resume</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>AI Interviews</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={18} color="#818cf8" />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{metrics.totalInterviews}</p>
          <span style={{ fontSize: '0.75rem', color: metrics.totalInterviews > 0 ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <TrendingUp size={12} /> {metrics.totalInterviews > 0 ? 'Active Preparation' : 'No interviews taken yet'}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Avg Tech Score</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={18} color="#10b981" />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{metrics.averageScore}%</p>
          <div className="progress-bar-container" style={{ marginTop: '8px' }}>
            <div className="progress-bar-fill" style={{ width: `${metrics.averageScore}%` }}></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Resume ATS Score</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#f472b6" />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{metrics.latestAtsScore}%</p>
          <span style={{ fontSize: '0.75rem', color: metrics.latestAtsScore > 0 ? '#818cf8' : '#64748b', marginTop: '4px', display: 'block' }}>
            {metrics.latestAtsScore > 0 ? 'Audited ATS Score' : 'No resume scanned yet'}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Code Submissions</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code size={18} color="#fbbf24" />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{metrics.codingChallengesCompleted}</p>
          <span style={{ fontSize: '0.75rem', color: metrics.codingChallengesCompleted > 0 ? '#10b981' : '#64748b', marginTop: '4px', display: 'block' }}>
            {metrics.codingChallengesCompleted > 0 ? 'AI Complexity Verified' : 'No problems solved yet'}
          </span>
        </div>
      </div>

      {/* Grid: Domain Breakdown + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Domain Competency Cards */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>
            Placement Domain Competency
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(metrics.domainScores).map(([domain, score]) => (
              <div key={domain}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{domain}</span>
                  <span style={{ color: score >= 80 ? '#10b981' : score > 0 ? '#fbbf24' : '#64748b', fontWeight: 700 }}>
                    {score > 0 ? `${score}%` : '0% (Not Started)'}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Recent Activity</h3>
            {metrics.recentActivity.length > 0 && (
              <button onClick={() => onNavigate('analytics')} style={{ background: 'none', color: '#6366f1', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                View All
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((act, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-card)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle2 size={16} color="#6366f1" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{act.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {act.date}
                      </p>
                    </div>
                  </div>

                  <span className="badge badge-green">{act.score}% Score</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  No Practice Activities Recorded Yet
                </p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                  Take an AI Mock Interview, complete a Coding Sandbox challenge, or scan your resume to track your real-time placement index.
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => onNavigate('interview')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                    Start Interview
                  </button>
                  <button onClick={() => onNavigate('ai-coding')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                    Solve Coding
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
