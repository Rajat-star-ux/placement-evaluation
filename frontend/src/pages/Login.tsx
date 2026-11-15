import React, { useState } from 'react';
import { 
  Sparkles, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap 
} from 'lucide-react';
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
    <div className="login-viewport" style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      backgroundColor: '#060913',
      backgroundImage: "url('/login-bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      overflowX: 'hidden',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Subtle radial vignette overlay to keep text crisp and preserve background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(6, 9, 19, 0.35) 0%, rgba(4, 6, 14, 0.8) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Main Two-Column Layout */}
      <div className="login-grid" style={{
        position: 'relative',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.95fr',
        gap: '48px',
        maxWidth: '1160px',
        width: '100%',
        alignItems: 'center'
      }}>

        {/* ================= LEFT HERO PRESENTATION ================= */}
        <div style={{ textAlign: 'left' }}>
          
          {/* Top Pill Badge with floating sparkle star & 3D Graduation Cap */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '22px' }}>
            {/* Sparkle on top-left */}
            <div style={{ position: 'absolute', top: '-10px', left: '-12px' }}>
              <Sparkles size={16} color="#c084fc" style={{ filter: 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.9))' }} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 18px',
              borderRadius: '30px',
              background: 'rgba(30, 27, 75, 0.65)',
              border: '1px solid rgba(129, 140, 248, 0.45)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#818cf8',
                boxShadow: '0 0 8px #818cf8'
              }} />
              <span style={{ color: '#c7d2fe', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.2px' }}>
                AI Placement &amp; Interview System • FYP 2026
              </span>
            </div>

            {/* 3D-styled Graduation Cap sitting on the top-right edge */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '-14px',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 4px 14px rgba(147, 51, 234, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(12deg)'
            }}>
              <GraduationCap size={18} color="#ffffff" />
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: '3.1rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '18px',
            letterSpacing: '-0.5px'
          }}>
            <span style={{ display: 'block', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Prepare, Practice &amp;
            </span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 35px rgba(168, 85, 247, 0.45)'
            }}>
              Get Hired Faster
            </span>
          </h1>

          {/* Subtitle paragraph in muted slate */}
          <p style={{
            color: '#94a3b8',
            fontSize: '1.02rem',
            lineHeight: 1.6,
            marginBottom: '26px',
            maxWidth: '500px'
          }}>
            AI-driven mock interviews with speech evaluation, resume ATS skill gap analysis, 
            live coding sandbox, and company placement kits.
          </p>

          {/* 4 Feature Rows with emerald-green circular checks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {[
              'Real-Time Audio Voice AI Interviewer',
              'Multi-Metric Evaluation (Technical, Clarity, Sentiment)',
              'ATS Resume Skill Gap Scanner',
              'Pre-packaged Kits (Amazon, TCS, Infosys, Google)'
            ].map((feat, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                fontWeight: 500
              }}>
                <CheckCircle2 size={19} color="#34d399" style={{
                  filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.6))',
                  flexShrink: 0
                }} />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT CARD COLUMN ================= */}
        {/* Aligns directly over the pre-rendered box and 3D badges in login-bg.png */}
        <div className="login-card-col" style={{
          position: 'relative',
          width: '100%',
          maxWidth: '485px',
          margin: '0 auto',
          transform: 'translateY(-24px)'
        }}>
          
          {/* Frosted Glassmorphism Card that snaps right into the background box */}
          <div style={{
            position: 'relative',
            background: 'rgba(18, 25, 52, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(129, 140, 248, 0.45)',
            borderRadius: '26px',
            boxShadow: '0 0 45px rgba(99, 102, 241, 0.28), 0 25px 50px rgba(0, 0, 0, 0.55)',
            padding: '36px 34px 30px',
            textAlign: 'left'
          }}>
            
            {/* Card Title & Subtitle */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.3px', margin: 0 }}>
                {isRegister ? 'Create Candidate Account' : 'Sign In to Portal'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '6px', marginBottom: 0 }}>
                {isRegister 
                  ? 'Start your AI placement preparation journey' 
                  : 'Access your dashboard, mock sessions & ATS reports'}
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div style={{
                padding: '11px 15px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.16)',
                border: '1px solid rgba(239, 68, 68, 0.38)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Email Address with Glowing Indigo Outline */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@fyp.com"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1.5px solid #6366f1',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.35)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Target Job Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Software Development Engineer">Software Development Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Data Engineer / Analyst">Data Engineer / Analyst</option>
                  </select>
                </div>
              )}

              {/* Submit Button with Horizontal Gradient */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '6px',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <span>{loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In Now')}</span>
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            {/* Toggle Sign In / Register */}
            <div style={{ marginTop: '18px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {isRegister ? 'Already registered? Sign In' : 'New student? Register account'}
              </button>
            </div>

            {/* Footer with Shield */}
            <div style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              color: '#64748b',
              fontSize: '0.78rem'
            }}>
              <Shield size={14} color="#818cf8" />
              <span>JWT Secure Authentication Enabled</span>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .login-card-col {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};
