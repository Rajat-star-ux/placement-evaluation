import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { MockInterviewRoom } from './pages/MockInterviewRoom';
import { CodingSandbox } from './pages/CodingSandbox';
import { AiAssistedCoding } from './pages/AiAssistedCoding';
import { CompanyKits } from './pages/CompanyKits';
import { AnalyticsReport } from './pages/AnalyticsReport';
import type { AuthResponse } from './types';

export function App() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.email) {
          setUser(parsed);
          return;
        }
      } catch {
        // continue
      }
    }
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      setUser({
        token: storedToken,
        type: 'Bearer',
        id: 1,
        email: 'student@fyp.com',
        fullName: 'Student Candidate',
        role: 'ROLE_STUDENT',
        targetRole: 'Software Development Engineer'
      });
    }
  }, []);

  const handleLoginSuccess = (u: AuthResponse) => {
    localStorage.setItem('current_user', JSON.stringify(u));
    if (u.token) {
      localStorage.setItem('jwt_token', u.token);
    }
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Navbar user={user} />

        {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'interview' && <MockInterviewRoom />}
        {activeTab === 'resume' && <ResumeAnalyzer />}
        {activeTab === 'coding' && <CodingSandbox />}
        {activeTab === 'ai-coding' && <AiAssistedCoding />}
        {activeTab === 'company-kits' && <CompanyKits />}
        {activeTab === 'analytics' && <AnalyticsReport user={user} />}
      </main>
    </div>
  );
}

export default App;
