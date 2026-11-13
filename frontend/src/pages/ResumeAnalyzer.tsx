import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FileUp, 
  X, 
  Loader2, 
  RotateCcw,
  Check,
  Plus
} from 'lucide-react';
import type { ResumeAnalysis } from '../types';
import { api } from '../services/api';
import { extractTextFromPDF } from '../utils/pdfParser';
import { calculateRealtimeATSAnalysis } from '../utils/atsScanner';
import { ThemeToggle } from '../components/ThemeToggle';

export const ResumeAnalyzer: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [resumeText, setResumeText] = useState(`ALEX JOHNSON
Email: alex.j@university.edu | Phone: +1 555-0199 | Location: New York, NY
GitHub: github.com/alexj-fyp | LinkedIn: linkedin.com/in/alexj

SUMMARY
Full-stack software developer with experience in Java, Spring Boot, React, and REST APIs. Built multiple high-concurrency projects during engineering degree.

SKILLS
Programming Languages: Java, JavaScript, TypeScript, SQL, HTML5, CSS3
Frameworks & Libraries: Spring Boot, React, Node.js, Hibernate, JPA
Database & Tools: MySQL, Git, JUnit, Maven, VS Code

PROJECTS
1. Placement Evaluation & Mock Interview System (Spring Boot, React, MySQL)
- Architected RESTful microservices for real-time speech and NLP interview evaluation.
- Implemented JWT authentication and Spring Security role-based access control.
- Designed database schema in MySQL with optimized JPA indexing.`);
  
  const [fileName, setFileName] = useState('Alex_Johnson_Resume_2026.pdf');
  const [fileSize, setFileSize] = useState<string>('148 KB');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>({
    type: 'success',
    text: 'Default sample resume loaded. You can upload your own PDF anytime!'
  });
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const samplePresets = [
    {
      name: 'Software Engineer (Java/Spring)',
      role: 'Software Development Engineer',
      fileName: 'Alex_Johnson_SDE_Resume.pdf',
      text: `ALEX JOHNSON
Email: alex.j@university.edu | Phone: +1 555-0199 | Location: New York, NY
GitHub: github.com/alexj-fyp | LinkedIn: linkedin.com/in/alexj

SUMMARY
Full-stack software developer with strong foundation in Java, Spring Boot, Data Structures, and REST APIs. Built scalable microservices during engineering degree.

SKILLS
Programming Languages: Java, JavaScript, TypeScript, SQL, Python
Frameworks & Libraries: Spring Boot, React, Node.js, Hibernate, JPA, System Design
Database & Tools: MySQL, Git, Docker, JUnit, Maven, Redis

EXPERIENCE & PROJECTS
Placement Evaluation System (Spring Boot, React, MySQL)
- Engineered RESTful microservices for real-time interview evaluation.
- Implemented JWT security and Redis caching to reduce latency by 35%.`
    },
    {
      name: 'Frontend Developer (React/TS)',
      role: 'Frontend Developer',
      fileName: 'Sarah_Smith_Frontend_Resume.pdf',
      text: `SARAH SMITH
Email: sarah.smith@cs.edu | GitHub: github.com/sarah-frontend | Portfolio: sarahsmith.dev

SUMMARY
Passionate Frontend Developer specializing in React, TypeScript, and modern CSS/Glassmorphism design systems. Experienced in Redux state management and REST API integration.

SKILLS
Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL
Libraries & Frameworks: React 18, Next.js, Redux Toolkit, Tailwind CSS, Vite
Tools: Git, GitHub, Figma, Jest, Webpack, Postman

PROJECTS
Interactive Analytics Dashboard (React, TypeScript, Recharts)
- Developed responsive component library with 99.8% test coverage.
- Optimized bundle size by 40% using code splitting and lazy loading.`
    },
    {
      name: 'Data Analyst & ML',
      role: 'Data Engineer / Analyst',
      fileName: 'David_Lee_Data_Resume.pdf',
      text: `DAVID LEE
Email: david.lee@data.org | LinkedIn: linkedin.com/in/davidlee-data

SUMMARY
Data Engineer / Analyst with extensive hands-on experience in Python, SQL data pipelines, ETL architectures, and predictive machine learning models.

SKILLS
Programming: Python, SQL, R, Bash
Data & Analytics: Pandas, NumPy, Spark, Tableau, ETL, Power BI, Statistics, Machine Learning
Databases: PostgreSQL, MySQL, Snowflake, MongoDB

PROJECTS
Predictive Placement Placement Analytics Pipeline (Python, Spark, Tableau)
- Processed 100,000+ candidate performance logs using Apache Spark.
- Created interactive Tableau dashboards tracking placement success indicators.`
    }
  ];

  const handleProcessFile = async (file: File) => {
    if (!file) return;

    // Check file extension
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isText = file.name.toLowerCase().endsWith('.txt') || file.type.startsWith('text/');

    if (!isPdf && !isText) {
      setUploadMessage({
        type: 'error',
        text: 'Please upload a PDF (.pdf) or text (.txt) file.'
      });
      return;
    }

    // Format file size
    const sizeInKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;
    setFileSize(sizeFormatted);
    setFileName(file.name);
    setIsExtracting(true);
    setUploadMessage(null);

    try {
      if (isText) {
        const text = await file.text();
        setResumeText(text);
        setUploadMessage({
          type: 'success',
          text: `Text file "${file.name}" loaded successfully (${text.split(/\s+/).length} words).`
        });
      } else {
        // PDF parsing
        const result = await extractTextFromPDF(file);
        if (!result.text || result.text.length < 20) {
          setUploadMessage({
            type: 'warning',
            text: `"${file.name}" was uploaded, but minimal text was found. If this is a scanned document, consider copying and pasting your resume text below.`
          });
        } else {
          setResumeText(result.text);
          setUploadMessage({
            type: 'success',
            text: `Successfully parsed "${file.name}" (${result.wordCount} words, ${result.pageCount} page${result.pageCount > 1 ? 's' : ''}).`
          });
        }
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      const isScanned =
        err?.message?.toLowerCase().includes('scanned') ||
        err?.message?.toLowerCase().includes('ocr') ||
        err?.message?.toLowerCase().includes('selectable text');

      setUploadMessage({
        type: 'warning',
        text: isScanned
          ? `"${file.name}" appears to be a scanned document or image without selectable text. You can copy & paste your resume text manually into the editor below.`
          : `Could not parse text directly from "${file.name}". You can paste your resume text manually into the editor below.`
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset input so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setResumeText(preset.text);
    setTargetRole(preset.role);
    setFileName(preset.fileName);
    setFileSize('120 KB');
    setUploadMessage({
      type: 'success',
      text: `Loaded preset profile for ${preset.role}.`
    });
  };

  const handleClearResume = () => {
    setResumeText('');
    setFileName('empty_resume.txt');
    setFileSize('0 KB');
    setAnalysis(null);
    setUploadMessage({
      type: 'warning',
      text: 'Resume content cleared. Upload a PDF or paste text to scan.'
    });
  };

  const realtimePreview = useMemo(() => {
    if (!resumeText.trim()) return null;
    return calculateRealtimeATSAnalysis(resumeText, targetRole);
  }, [resumeText, targetRole]);

  const handleAddSkillToResume = (skill: string) => {
    setResumeText((prev) => {
      if (prev.toLowerCase().includes(skill.toLowerCase())) return prev;
      if (/skills/i.test(prev)) {
        return prev.replace(/(skills[^\n]*\n)/i, `$1${skill}, `);
      }
      return `${prev}\n\nSKILLS:\n${skill}`;
    });
    setUploadMessage({
      type: 'success',
      text: `Added "${skill}" to resume. Re-scan to see your score update in real-time!`
    });
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert('Please add or upload resume text before scanning.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.analyzeResume(resumeText, targetRole, fileName);
      const enriched = {
        ...res,
        breakdown: res.breakdown || realtimePreview?.breakdown
      };
      setAnalysis(enriched);
    } catch {
      if (realtimePreview) {
        setAnalysis(realtimePreview);
      } else {
        alert('Analysis failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;

  return (
    <div>
      {/* Hidden file input for resume PDF upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.txt"
        style={{ display: 'none' }}
      />

      {/* Header bar with Title & Light/Dark Mode Button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            AI Resume ATS & Skill Gap Scanner
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Evaluate your resume against target campus recruiter keywords and extract missing tech stack gaps.
          </p>
        </div>

        {/* Action Controls: Light/Dark Mode Button & Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle showLabel={true} />
        </div>
      </div>

      {/* Main Grid: Upload & Controls on Left, Results on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '28px' }}>
        {/* Left Side: Upload & Input */}
        <div className="glass-card" style={{ padding: '24px' }}>
          
          {/* Target Role Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Target Job Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Software Development Engineer">Software Development Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Engineer / Analyst">Data Engineer / Analyst</option>
            </select>
          </div>

          {/* Upload Resume PDF Section with Prominent Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="var(--primary)" />
                <span>Upload Candidate Resume</span>
              </label>

              {/* Button to Add Resume PDF */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isExtracting ? (
                  <>
                    <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Extracting PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>Add Resume PDF</span>
                  </>
                )}
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={`resume-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '18px 16px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <FileUp size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Drop your resume PDF here, or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse file</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Supports PDF and TXT documents • Extracted automatically
                  </p>
                </div>
              </div>
            </div>

            {/* Currently Active File Info Chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <FileText size={16} color="#6366f1" />
                <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                  {fileName}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({fileSize})</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  {wordCount} words
                </span>
                <button
                  type="button"
                  onClick={handleClearResume}
                  title="Clear text"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Upload Message Notification */}
            {uploadMessage && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: uploadMessage.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.12)' 
                  : uploadMessage.type === 'warning' 
                  ? 'rgba(245, 158, 11, 0.12)' 
                  : 'rgba(239, 68, 68, 0.12)',
                color: uploadMessage.type === 'success' 
                  ? '#10b981' 
                  : uploadMessage.type === 'warning' 
                  ? '#f59e0b' 
                  : '#ef4444',
                border: `1px solid ${
                  uploadMessage.type === 'success' 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : uploadMessage.type === 'warning' 
                    ? 'rgba(245, 158, 11, 0.3)' 
                    : 'rgba(239, 68, 68, 0.3)'
                }`
              }}>
                {uploadMessage.type === 'success' && <Check size={14} />}
                {uploadMessage.type === 'warning' && <AlertCircle size={14} />}
                {uploadMessage.type === 'error' && <AlertCircle size={14} />}
                <span>{uploadMessage.text}</span>
              </div>
            )}
          </div>

          {/* Quick Presets Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Or Try Sample Profiles
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Resume Text Editor / Viewer */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Extracted Resume Content
                </label>
                {realtimePreview && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      background:
                        realtimePreview.atsScore >= 80
                          ? 'rgba(16, 185, 129, 0.15)'
                          : realtimePreview.atsScore >= 60
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        realtimePreview.atsScore >= 80
                          ? '#10b981'
                          : realtimePreview.atsScore >= 60
                          ? '#f59e0b'
                          : '#ef4444',
                      border: `1px solid ${
                        realtimePreview.atsScore >= 80
                          ? 'rgba(16, 185, 129, 0.3)'
                          : realtimePreview.atsScore >= 60
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)'
                      }`
                    }}
                  >
                    Live Score: {realtimePreview.atsScore}%
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Editable Text</span>
            </div>
            <textarea
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste or upload resume content here..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-code)',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Scan Action Button */}
          <button 
            onClick={handleAnalyze} 
            disabled={loading || isExtracting || !resumeText.trim()} 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '14px',
              fontSize: '0.95rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Scanning Resume & Extracting Gaps...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Run ATS Scanner Now</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Results */}
        <div>
          {analysis ? (
            <div className="glass-card glass-card-glow" style={{ padding: '28px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                paddingBottom: '20px', 
                borderBottom: '1px solid var(--border-card)', 
                marginBottom: '20px' 
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                    ATS Match Index
                  </span>
                  <h3 style={{ 
                    fontSize: '2.6rem', 
                    fontWeight: 800, 
                    color: analysis.atsScore >= 80 ? '#10b981' : analysis.atsScore >= 60 ? '#f59e0b' : '#ef4444',
                    lineHeight: 1.1,
                    marginTop: '4px'
                  }}>
                    {analysis.atsScore}%
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {analysis.atsScore >= 80 
                      ? '🌟 High Recruiter Match Rate' 
                      : analysis.atsScore >= 60 
                      ? '⚡ Moderate Match - Keyword Optimization Recommended' 
                      : '⚠️ Low Match - High Tech Stack Gaps'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-green" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    {analysis.targetJobRole}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    File: {fileName}
                  </p>
                </div>
              </div>

              {/* Progress bar visual */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Overall ATS Score</span>
                  <span>{analysis.atsScore}% / 100%</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${analysis.atsScore}%`,
                      background:
                        analysis.atsScore >= 80
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : analysis.atsScore >= 60
                          ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                          : 'linear-gradient(90deg, #ef4444, #dc2626)'
                    }}
                  />
                </div>
              </div>

              {/* Real-time Detailed Category Breakdown */}
              {analysis.breakdown && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '22px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-card)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Target Keywords</span>
                      <strong style={{ color: 'var(--text-main)' }}>{analysis.breakdown.keywordScore}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '5px' }}>
                      <div className="progress-bar-fill" style={{ width: `${analysis.breakdown.keywordScore}%`, background: '#6366f1' }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {analysis.breakdown.matchedCount} of {analysis.breakdown.totalTargetKeywords} target skills
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Impact & Verbs</span>
                      <strong style={{ color: 'var(--text-main)' }}>{analysis.breakdown.impactScore}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '5px' }}>
                      <div className="progress-bar-fill" style={{ width: `${analysis.breakdown.impactScore}%`, background: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {analysis.breakdown.metricCount} metrics, {analysis.breakdown.verbCount} action verbs
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Section Structure</span>
                      <strong style={{ color: 'var(--text-main)' }}>{analysis.breakdown.structureScore}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '5px' }}>
                      <div className="progress-bar-fill" style={{ width: `${analysis.breakdown.structureScore}%`, background: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Contact, Skills, Exp, Edu
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Length & Quality</span>
                      <strong style={{ color: 'var(--text-main)' }}>{analysis.breakdown.lengthScore}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '5px' }}>
                      <div className="progress-bar-fill" style={{ width: `${analysis.breakdown.lengthScore}%`, background: '#06b6d4' }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {analysis.breakdown.wordCount} words (ideal: 300-800)
                    </span>
                  </div>
                </div>
              )}

              {/* Extracted Matched Skills */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Found Matched Skills ({analysis.extractedSkills.length})</span>
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.extractedSkills.map((sk, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '16px', 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        border: '1px solid rgba(16, 185, 129, 0.35)', 
                        color: '#10b981', 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={12} />
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="#ef4444" />
                    <span>Missing Target Keywords ({analysis.missingSkills.length})</span>
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click chip to insert into resume</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.missingSkills.map((sk, idx) => (
                    <button 
                      key={idx} 
                      type="button"
                      onClick={() => handleAddSkillToResume(sk)}
                      title={`Click to add "${sk}" to your resume`}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '16px', 
                        background: 'rgba(239, 68, 68, 0.12)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)', 
                        color: '#f87171', 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      <Plus size={12} />
                      <span>Add {sk}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Actionable Recommendations
                </h4>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Re-scan button */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                >
                  <RotateCcw size={14} />
                  <span>Re-evaluate Resume</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'var(--primary)'
              }}>
                <FileText size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>Ready to Scan Resume</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '10px', maxWidth: '380px', margin: '10px auto 0', lineHeight: 1.6 }}>
                Click <strong style={{ color: 'var(--primary)' }}>"Add Resume PDF"</strong> to upload your real candidate resume or drag and drop a PDF file. Select your target role and run the AI scanner.
              </p>
              
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', padding: '10px 18px' }}
                >
                  <Upload size={16} />
                  <span>Select Resume PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
