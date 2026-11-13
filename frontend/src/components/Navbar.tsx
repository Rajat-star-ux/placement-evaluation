import React from 'react';
import { User as UserIcon, Bell, Target } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  user: any;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px',
      paddingBottom: '16px',
      borderBottom: '1px solid var(--border-card)'
    }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Welcome Back, <span style={{ color: '#6366f1' }}>{user?.fullName || 'Candidate'}</span> 👋
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          AI Placement Readiness System • Target: <strong style={{ color: '#10b981' }}>{user?.targetRole || 'Software Engineer'}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          fontSize: '0.8rem',
          color: '#10b981',
          fontWeight: 600
        }}>
          <Target size={15} />
          <span>System Status: AI Evaluator Active</span>
        </div>

        <ThemeToggle />

        <button style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Bell size={18} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px 6px 6px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '24px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserIcon size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{user?.fullName?.split(' ')[0] || 'User'}</span>
        </div>
      </div>
    </header>
  );
};
