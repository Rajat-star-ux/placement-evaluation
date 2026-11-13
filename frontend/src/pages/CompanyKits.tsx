import React, { useState } from 'react';
import { Building2, Sparkles, Award } from 'lucide-react';

export const CompanyKits: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState('Amazon');

  const companyKits = [
    {
      name: 'Amazon',
      tagline: 'SDE-1 Technical & Leadership Principles',
      color: '#f59e0b',
      questions: [
        {
          title: 'Internal Mechanics of HashMap & Collision Resolution',
          domain: 'Java Core',
          desc: 'How does HashMap store items in Java 8+? Detail hashcode spreading, load factor threshold (0.75), and treeification to Red-Black trees.',
          answer: 'Key hashCode() is hashed. Buckets start as LinkedLists. When bucket size exceeds 8 and total capacity >= 64, it converts to a Red-Black Tree for O(log N) lookup.'
        },
        {
          title: 'Amazon Leadership Principle: Customer Obsession',
          domain: 'Behavioral / HR',
          desc: 'Give an example of when you went above and beyond for a customer or project user. Use the STAR framework.',
          answer: 'Situation: User reported 500 API errors during high traffic. Task: Resolve root cause within 1 hour. Action: Optimized database connection pool and added Redis caching. Result: Latency dropped by 65%.'
        }
      ]
    },
    {
      name: 'TCS',
      tagline: 'Digital & Ninja Placement Archive',
      color: '#10b981',
      questions: [
        {
          title: 'Work & Time Quantitative Aptitude',
          domain: 'Quantitative Aptitude',
          desc: 'A can complete a project in 12 days and B in 16 days. They work together for 4 days, then A leaves. How long will B take to complete the rest?',
          answer: 'Work done in 4 days = 4*(1/12 + 1/16) = 7/12. Remaining work = 5/12. Time taken by B = (5/12) / (1/16) = 6.67 days.'
        },
        {
          title: 'Preserving Order in Array Filtering',
          domain: 'Data Structures',
          desc: 'How do you remove duplicates from an array while preserving original insertion order in Java?',
          answer: 'Use a LinkedHashSet or Java 8 stream().distinct() which maintains insertion order in linear O(N) time.'
        }
      ]
    },
    {
      name: 'Infosys',
      tagline: 'Power Programmer & Specialist Kit',
      color: '#6366f1',
      questions: [
        {
          title: 'Four Pillars of Object Oriented Programming',
          domain: 'Core Java',
          desc: 'Explain Abstraction, Encapsulation, Inheritance, and Polymorphism with production code examples.',
          answer: 'Encapsulation hides state using private variables. Abstraction exposes interface contracts. Inheritance reuses parent code. Polymorphism enables method overriding.'
        }
      ]
    },
    {
      name: 'Google',
      tagline: 'Algorithms & System Architecture',
      color: '#ec4899',
      questions: [
        {
          title: 'Container With Most Water (Two Pointers)',
          domain: 'Data Structures',
          desc: 'Find two vertical lines that form a container storing maximum water in O(N) time.',
          answer: 'Use left=0 and right=n-1 pointers. Calculate current area, update max area, and move the shorter height pointer inward.'
        }
      ]
    }
  ];

  const activeKit = companyKits.find((c) => c.name === selectedCompany) || companyKits[0];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
          Company Placement Question Kits
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
          Targeted question archives and interview strategies for top campus recruiting tech companies.
        </p>
      </div>

      {/* Company Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {companyKits.map((comp) => {
          const isSelected = selectedCompany === comp.name;
          return (
            <div
              key={comp.name}
              onClick={() => setSelectedCompany(comp.name)}
              className={`glass-card ${isSelected ? 'glass-card-glow' : ''}`}
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: isSelected ? `1px solid ${comp.color}` : '1px solid var(--border-card)',
                background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${comp.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} color={comp.color} />
                </div>
                {isSelected && <Award size={16} color={comp.color} />}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{comp.name}</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{comp.tagline}</p>
            </div>
          );
        })}
      </div>

      {/* Questions Flashcards */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color={activeKit.color} />
            <span>{activeKit.name} Interview Kit ({activeKit.questions.length} Core Questions)</span>
          </h3>
          <span className="badge badge-purple">{activeKit.tagline}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeKit.questions.map((q, idx) => (
            <div key={idx} style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-green">{q.domain}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Question #{idx + 1}</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                {q.title}
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '14px' }}>
                {q.desc}
              </p>

              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Model Solution / Key Approach:
                </span>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  {q.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
