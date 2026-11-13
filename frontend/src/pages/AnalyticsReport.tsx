import React, { useEffect, useState } from 'react';
import { Download, Trophy, Award } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { api } from '../services/api';
import type { DashboardMetrics } from '../types';

interface AnalyticsReportProps {
  user: any;
}

export const AnalyticsReport: React.FC<AnalyticsReportProps> = ({ user }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    api.getDashboardMetrics().then((data) => {
      setMetrics(data);
    });
  }, []);

  const totalInterviews = metrics?.totalInterviews || 0;
  const avgScore = metrics?.averageScore || 0;
  const latestAtsScore = metrics?.latestAtsScore || 0;
  const codingChallengesCompleted = metrics?.codingChallengesCompleted || 0;
  const domainScores = metrics?.domainScores || {
    'Java Core': 0,
    'Data Structures': 0,
    'System Design': 0,
    'Behavioral / HR': 0,
    'Database & SQL': 0
  };

  const overallReadiness = Math.round(
    (avgScore * 0.4) + (latestAtsScore * 0.4) + (Math.min(100, codingChallengesCompleted * 8) * 0.2)
  );

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('AI PLACEMENT EVALUATION & READINESS REPORT', 14, 20);
    doc.setFontSize(10);
    doc.text('Final Year Project System • Automated Performance Audit', 14, 30);

    // Candidate Details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Candidate Name: ${user?.fullName || 'Candidate'}`, 14, 55);
    doc.text(`Email: ${user?.email || 'student@fyp.com'}`, 14, 63);
    doc.text(`Target Job Role: ${user?.targetRole || 'Software Development Engineer'}`, 14, 71);
    doc.text(`Report Generation Date: ${new Date().toLocaleDateString()}`, 14, 79);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 85, 196, 85);

    // Summary Metrics
    doc.setFontSize(14);
    doc.text('Overall Placement Performance Summary', 14, 98);
    
    doc.setFontSize(10);
    doc.text(`• Overall Placement Readiness Index: ${overallReadiness}%`, 20, 110);
    doc.text(`• Technical Mock Interviews: ${totalInterviews} Completed (Average Score: ${avgScore}%)`, 20, 118);
    doc.text(`• Resume ATS Keyword Match Rating: ${latestAtsScore > 0 ? `${latestAtsScore}% Match` : '0% (No Resume Scanned)'}`, 20, 126);
    doc.text(`• Coding Sandbox Challenges Solved: ${codingChallengesCompleted} Problems`, 20, 134);

    doc.line(14, 142, 196, 142);

    // Domain Competency Table
    doc.setFontSize(14);
    doc.text('Domain Technical Competency Breakdown', 14, 155);

    let y = 168;
    Object.entries(domainScores).forEach(([domain, score]) => {
      const status = score >= 80 ? 'Proficient' : score >= 60 ? 'Intermediate' : score > 0 ? 'Foundational' : 'Not Attempted';
      doc.setFontSize(10);
      doc.text(`• ${domain}`, 20, y);
      doc.text(`${score}% (${status})`, 140, y);
      y += 10;
    });

    // Verification Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Verified by AI Evaluation Engine • Spring Boot + React FYP Architecture', 14, 280);

    doc.save(`Placement_Readiness_Report_${user?.fullName?.replace(/\s+/g, '_') || 'Candidate'}.pdf`);
  };

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Comprehensive Placement Audit & PDF Exporter
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Generate a formal evaluation document for your Final Year Project demonstration.
          </p>
        </div>

        <button onClick={handleDownloadPDF} className="btn-primary" style={{ padding: '14px 24px' }}>
          <Download size={18} />
          <span>Download PDF Evaluation Report</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Readiness Summary */}
        <div className="glass-card glass-card-glow" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={22} color="#10b981" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Audited Readiness Index</span>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>{overallReadiness}%</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <span style={{ color: '#cbd5e1' }}>Candidate Name</span>
              <strong style={{ color: '#f8fafc' }}>{user?.fullName || 'Candidate'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <span style={{ color: '#cbd5e1' }}>Target Role</span>
              <strong style={{ color: '#10b981' }}>{user?.targetRole || 'Software Development Engineer'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <span style={{ color: '#cbd5e1' }}>Technical Mock Interviews</span>
              <strong style={{ color: totalInterviews > 0 ? '#10b981' : '#64748b' }}>
                {totalInterviews > 0 ? `${totalInterviews} Completed (${avgScore}% Avg)` : '0 Completed'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <span style={{ color: '#cbd5e1' }}>Latest ATS Resume Rating</span>
              <strong style={{ color: latestAtsScore > 0 ? '#10b981' : '#64748b' }}>
                {latestAtsScore > 0 ? `${latestAtsScore}% Match` : 'Not Scanned Yet'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <span style={{ color: '#cbd5e1' }}>Coding Sandbox Solved</span>
              <strong style={{ color: codingChallengesCompleted > 0 ? '#fbbf24' : '#64748b' }}>
                {codingChallengesCompleted} Problems
              </strong>
            </div>
          </div>
        </div>

        {/* Skill Gap Matrix */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="#6366f1" />
            <span>Placement Domain Readiness Ratings</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(domainScores).map(([domain, score], idx) => {
              const status = score >= 80 ? 'Proficient' : score >= 60 ? 'Intermediate' : score > 0 ? 'Foundational' : 'Not Attempted';
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{domain}</p>
                    <span style={{ fontSize: '0.75rem', color: score > 0 ? '#10b981' : '#64748b' }}>{status}</span>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.85rem', background: score > 0 ? undefined : 'rgba(100, 116, 139, 0.2)', color: score > 0 ? undefined : '#94a3b8' }}>
                    {score}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
