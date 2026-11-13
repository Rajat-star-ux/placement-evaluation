import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  Code, 
  Building2, 
  BarChart3, 
  LogOut,
  Sparkles,
  Bot
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interview', label: 'AI Mock Interview', icon: Mic, badge: 'Voice' },
    { id: 'resume', label: 'Resume ATS Scanner', icon: FileText, badge: 'AI' },
    { id: 'coding', label: 'Coding Sandbox', icon: Code },
    { id: 'ai-coding', label: 'AI Assisted Coding', icon: Bot, badge: 'NEW' },
    { id: 'company-kits', label: 'Company Kits', icon: Building2 },
    { id: 'analytics', label: 'Performance Report', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>PlacementAI</h2>
          <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600, letterSpacing: '1px' }}>FYP SYSTEM</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                color: isActive ? '#f8fafc' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#6366f1' : '#94a3b8'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-card)' }}>
        <div style={{ padding: '8px', marginBottom: '12px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{user?.fullName || 'Candidate'}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.targetRole || 'SDE Role'}</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            width: '100%',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
