import React, { useState } from 'react';
import { Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const res = await api.register(fullName, email, password, targetRole);
        onLoginSuccess(res);
      } else {
        const res = await api.login(email, password);
        onLoginSuccess(res);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(11, 15, 25, 1) 70%)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '40px',
        maxWidth: '1000px',
        width: '100%',
        alignItems: 'center'
      }}>
        {/* Left Side Presentation */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontWeight: 600, fontSize: '0.8rem', marginBottom: '20px' }}>
            <Sparkles size={16} />
            <span>AI Placement & Interview System • FYP 2026</span>
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1, marginBottom: '16px' }}>
            Prepare, Practice & Get <span style={{ color: '#6366f1' }}>Hired Faster</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '28px' }}>
            AI-driven mock interviews with speech evaluation, resume ATS skill gap analysis, live coding sandbox, and company placement kits.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Real-Time Audio Voice AI Interviewer',
              'Multi-Metric Evaluation (Technical, Clarity, Sentiment)',
              'ATS Resume Skill Gap Scanner',
              'Pre-Packaged Kits (Amazon, TCS, Infosys, Google)'
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="glass-card glass-card-glow" style={{ padding: '36px' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {isRegister ? 'Create Candidate Account' : 'Sign In to Portal'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
              {isRegister ? 'Start your AI placement preparation journey' : 'Access your dashboard, mock sessions & ATS reports'}
            </p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-card)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@fyp.com"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-card)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-card)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>

            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Target Job Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-card)', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="Software Development Engineer">Software Development Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Data Engineer / Analyst">Data Engineer / Analyst</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
            >
              <span>{loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In Now')}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {isRegister ? 'Already registered? Sign In' : 'New student? Register account'}
            </button>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem' }}>
            <Shield size={14} />
            <span>JWT Secure Authentication Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
