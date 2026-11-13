import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Sparkles,
  Cpu,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Code2,
  RotateCcw,
  Copy,
  Check,
  Lightbulb,
  FileCode,
  Terminal,
  Clock,
  EyeOff,
  ChevronRight
} from 'lucide-react';
import type { CodeExecutionResult, CodingProblem } from '../types';
import { CODING_PROBLEMS } from '../data/codingProblems';
import { validateAndExecuteCode } from '../utils/codeValidator';
import { useTheme } from '../context/ThemeContext';

export const CodingSandbox: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Current selected problem & language
  const [selectedProblemId, setSelectedProblemId] = useState<string>(CODING_PROBLEMS[0].id);
  const currentProblem: CodingProblem =
    CODING_PROBLEMS.find((p) => p.id === selectedProblemId) || CODING_PROBLEMS[0];

  const [language, setLanguage] = useState<'java' | 'python' | 'cpp' | 'javascript'>('java');
  const [code, setCode] = useState<string>(currentProblem.starterCode['java'] || '');

  // UI States
  const [activeTab, setActiveTab] = useState<'description' | 'testcases'>('description');
  const [running, setRunning] = useState<boolean>(false);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);
  const [solutionLang, setSolutionLang] = useState<'java' | 'python' | 'cpp' | 'javascript'>('java');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync starter code when problem or language changes if user hasn't heavily modified it
  useEffect(() => {
    setCode(currentProblem.starterCode[language] || '');
    setSolutionLang(language);
    setResult(null);
    setHasExecuted(false);
    setShowSolution(false);
  }, [selectedProblemId, language]);

  // Handle Tab key in code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);

      // Reset cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Reset code to starter template
  const handleResetCode = () => {
    if (window.confirm('Reset code editor to the default starter template?')) {
      setCode(currentProblem.starterCode[language] || '');
      setResult(null);
      setHasExecuted(false);
      setShowSolution(false);
    }
  };

  // Copy user code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  // Copy solution code to clipboard
  const handleCopySolution = async () => {
    try {
      const solCode = currentProblem.solution.code[solutionLang] || '';
      await navigator.clipboard.writeText(solCode);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    } catch {
      alert('Failed to copy solution to clipboard');
    }
  };

  // Load solution into editor
  const handleLoadSolutionToEditor = () => {
    if (window.confirm('Load the reference optimal solution directly into the code editor?')) {
      setCode(currentProblem.solution.code[language] || '');
    }
  };

  // Execute Code and Find Errors
  const handleRunCode = async () => {
    setRunning(true);
    setHasExecuted(true);

    // Simulate compilation delay for realistic IDE compilation feel
    setTimeout(() => {
      const executionResult = validateAndExecuteCode(currentProblem, language, code);
      setResult(executionResult);
      setRunning(false);
    }, 600);
  };

  // Line numbers calculation
  const lineCount = Math.max(code.split('\n').length, 16);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // File extension helper
  const getFileExtension = (lang: string) => {
    switch (lang) {
      case 'java':
        return 'java';
      case 'python':
        return 'py';
      case 'cpp':
        return 'cpp';
      case 'javascript':
        return 'js';
      default:
        return 'txt';
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Code2 size={20} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Coding Sandbox & Technical Interview IDE
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Solve campus placement programming challenges with automated syntax/logic error detection, test case validation, and AI complexity evaluation.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Solution button is displayed once user executes code */}
          {hasExecuted && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="btn-secondary"
              style={{
                borderColor: showSolution ? 'var(--primary)' : 'var(--border-card)',
                background: showSolution
                  ? isLight
                    ? 'rgba(79, 70, 229, 0.12)'
                    : 'rgba(99, 102, 241, 0.2)'
                  : isLight
                  ? '#ffffff'
                  : 'rgba(255, 255, 255, 0.08)',
                color: showSolution ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: 600,
                boxShadow: isLight ? '0 2px 6px rgba(0, 0, 0, 0.05)' : undefined
              }}
            >
              {showSolution ? <EyeOff size={16} /> : <Lightbulb size={16} color={isLight ? '#d97706' : '#fbbf24'} />}
              <span>{showSolution ? 'Hide Solution' : 'Display Solution'}</span>
            </button>
          )}

          <button
            onClick={handleRunCode}
            disabled={running}
            className="btn-primary"
            style={{ padding: '12px 24px', opacity: running ? 0.75 : 1 }}
          >
            <Play size={16} fill="currentColor" />
            <span>{running ? 'Compiling & Analyzing...' : 'Run Code & Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Selector Control Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        {/* Question Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Select Question:
          </span>
          <select
            value={selectedProblemId}
            onChange={(e) => setSelectedProblemId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: '280px'
            }}
          >
            {CODING_PROBLEMS.map((problem) => (
              <option key={problem.id} value={problem.id}>
                [{problem.difficulty}] {problem.title}
              </option>
            ))}
          </select>

          {/* Difficulty & Domain Pills */}
          <span
            className={
              currentProblem.difficulty === 'Easy'
                ? 'badge badge-green'
                : currentProblem.difficulty === 'Medium'
                ? 'badge badge-orange'
                : 'badge badge-red'
            }
          >
            {currentProblem.difficulty}
          </span>
          <span className="badge badge-purple">{currentProblem.domain}</span>
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Language:
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="java">Java 17 (OpenJDK)</option>
            <option value="python">Python 3.11</option>
            <option value="cpp">C++ 20 (GCC)</option>
            <option value="javascript">JavaScript (Node.js)</option>
          </select>
        </div>
      </div>

      {/* Main Two-Panel Layout: Problem Statement (Left) + Code Area & Output (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(420px, 1.25fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* ================= LEFT PANEL: Problem / Questions Stated ================= */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Question Title & Company Tags */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {currentProblem.title}
              </h3>
              <span
                className={
                  currentProblem.difficulty === 'Easy'
                    ? 'badge badge-green'
                    : currentProblem.difficulty === 'Medium'
                    ? 'badge badge-orange'
                    : 'badge badge-red'
                }
              >
                {currentProblem.difficulty}
              </span>
            </div>

            {/* Companies who ask this */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Frequent In:</span>
              {currentProblem.companyTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid var(--border-card)',
                    color: isLight ? '#334155' : 'var(--text-muted)',
                    fontWeight: 500
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-card)', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('description')}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                color: activeTab === 'description' ? 'var(--primary)' : isLight ? '#64748b' : 'var(--text-dim)',
                borderBottom: activeTab === 'description' ? '2px solid var(--primary)' : '2px solid transparent',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Problem Statement
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                color: activeTab === 'testcases' ? 'var(--primary)' : isLight ? '#64748b' : 'var(--text-dim)',
                borderBottom: activeTab === 'testcases' ? '2px solid var(--primary)' : '2px solid transparent',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Test Cases ({currentProblem.testCases.length})
            </button>
          </div>

          {/* Tab 1: Problem Description */}
          {activeTab === 'description' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Question Text */}
              <div
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.7,
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-line'
                }}
              >
                {currentProblem.description}
              </div>

              {/* Examples Section */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Examples:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentProblem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="sandbox-subcard"
                      style={{ fontSize: '0.85rem', fontFamily: 'var(--font-code)' }}
                    >
                      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ color: isLight ? '#4f46e5' : '#818cf8', fontWeight: 700 }}>
                          Example {idx + 1}:
                        </span>
                      </div>
                      <div style={{ color: isLight ? '#0369a1' : '#38bdf8', marginBottom: '3px' }}>
                        <span style={{ color: isLight ? '#475569' : '#94a3b8' }}>Input: </span>
                        {ex.input}
                      </div>
                      <div style={{ color: isLight ? '#047857' : '#10b981', marginBottom: '4px' }}>
                        <span style={{ color: isLight ? '#475569' : '#94a3b8' }}>Output: </span>
                        {ex.output}
                      </div>
                      {ex.explanation && (
                        <div style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px' }}>
                          Explanation: {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints Section */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Constraints:
                </h4>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentProblem.constraints.map((c, i) => (
                    <li key={i} style={{ color: isLight ? '#334155' : 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-code)' }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Test Cases */}
          {activeTab === 'testcases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Your code will be compiled and evaluated against the following benchmark test cases:
              </p>
              {currentProblem.testCases.map((tc) => (
                <div
                  key={tc.id}
                  className="sandbox-subcard"
                  style={{ fontSize: '0.85rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: isLight ? '#4f46e5' : '#818cf8', fontSize: '0.82rem' }}>
                      Test Case #{tc.id}
                    </span>
                    {tc.explanation && (
                      <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : 'var(--text-dim)' }}>
                        {tc.explanation}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    <div><span style={{ color: isLight ? '#475569' : '#94a3b8' }}>Input: </span>{tc.input}</div>
                    <div><span style={{ color: isLight ? '#047857' : '#10b981' }}>Expected: </span>{tc.expected}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT PANEL: Area to Write Code + Errors & Output ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. Code Editor Area ("give area to write code") */}
          <div className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
            {/* Editor Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={16} color={isLight ? '#4f46e5' : '#818cf8'} />
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-code)', color: isLight ? '#4f46e5' : '#818cf8', fontWeight: 700 }}>
                  Solution.{getFileExtension(language)}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                  {language.toUpperCase()}
                </span>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleCopyCode}
                  title="Copy Code"
                  className="sandbox-pill-btn"
                >
                  {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleResetCode}
                  title="Reset to Starter Template"
                  className="sandbox-pill-btn"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Code Textarea with Line Numbers ("area to write code") */}
            <div className="code-editor-wrapper">
              <div className="editor-line-numbers">
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder="Enter your algorithm implementation here..."
                className="editor-textarea"
                rows={16}
              />
            </div>

            {/* Editor Footer / Hotkeys info */}
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: isLight ? '#64748b' : 'var(--text-dim)'
              }}
            >
              <span>Tip: Press Tab to indent 4 spaces. Semicolons and balanced brackets are verified on execution.</span>
              <span>{code.length} characters | {code.split('\n').length} lines</span>
            </div>
          </div>

          {/* 2. Execution Output & Error Finder ("after user enter code find errors in code after user executes") */}
          {hasExecuted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Execution Status Banner */}
              {result && (
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background:
                      result.status === 'ACCEPTED'
                        ? isLight
                          ? 'rgba(5, 150, 105, 0.08)'
                          : 'rgba(16, 185, 129, 0.12)'
                        : result.status === 'COMPILATION_ERROR'
                        ? isLight
                          ? 'rgba(220, 38, 38, 0.08)'
                          : 'rgba(239, 68, 68, 0.12)'
                        : isLight
                        ? 'rgba(217, 119, 6, 0.08)'
                        : 'rgba(245, 158, 11, 0.12)',
                    border:
                      result.status === 'ACCEPTED'
                        ? isLight
                          ? '1px solid rgba(5, 150, 105, 0.3)'
                          : '1px solid rgba(16, 185, 129, 0.3)'
                        : result.status === 'COMPILATION_ERROR'
                        ? isLight
                          ? '1px solid rgba(220, 38, 38, 0.3)'
                          : '1px solid rgba(239, 68, 68, 0.3)'
                        : isLight
                        ? '1px solid rgba(217, 119, 6, 0.3)'
                        : '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {result.status === 'ACCEPTED' ? (
                      <CheckCircle2 size={24} color={isLight ? '#047857' : '#10b981'} />
                    ) : result.status === 'COMPILATION_ERROR' ? (
                      <AlertCircle size={24} color={isLight ? '#dc2626' : '#ef4444'} />
                    ) : (
                      <XCircle size={24} color={isLight ? '#d97706' : '#f59e0b'} />
                    )}

                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color:
                            result.status === 'ACCEPTED'
                              ? isLight
                                ? '#047857'
                                : '#10b981'
                              : result.status === 'COMPILATION_ERROR'
                              ? isLight
                                ? '#b91c1c'
                                : '#ef4444'
                              : isLight
                              ? '#b45309'
                              : '#f59e0b'
                        }}
                      >
                        {result.status === 'ACCEPTED'
                          ? 'All Test Cases Passed! (Accepted)'
                          : result.status === 'COMPILATION_ERROR'
                          ? `Compilation Error: Found ${result.errors?.length || 1} Error(s)`
                          : result.errors?.some((e) => e.message.includes('No code entered'))
                          ? 'No Code Entered: Starter Template Unmodified'
                          : `Test Suites Failed: 0/${result.testCases?.length || 4} Passed`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {result.status === 'ACCEPTED'
                          ? `Runtime: ${result.runtimeMs} ms | Memory: 39.2 MB | Passed: ${result.testCases?.filter((t) => t.passed).length}/${result.testCases?.length}`
                          : result.errors?.some((e) => e.message.includes('No code entered'))
                          ? 'Please write your solution implementation in the code editor before executing.'
                          : 'Errors or algorithmic flaws detected during static analysis and test case evaluation.'}
                      </div>
                    </div>
                  </div>

                  {/* Display Solution Button */}
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: showSolution
                        ? isLight
                          ? 'rgba(79, 70, 229, 0.15)'
                          : 'rgba(99, 102, 241, 0.25)'
                        : 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      color: showSolution ? 'var(--primary)' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.35)',
                      cursor: 'pointer'
                    }}
                  >
                    <Lightbulb size={16} color={showSolution ? (isLight ? '#d97706' : '#fbbf24') : '#ffffff'} />
                    <span>{showSolution ? 'Hide Solution' : 'Display Solution'}</span>
                  </button>
                </div>
              )}

              {/* ERROR FINDER BOX: When errors are detected in user code */}
              {result?.errors && result.errors.length > 0 && (
                <div
                  className="glass-card"
                  style={{
                    padding: '20px',
                    borderColor: isLight ? 'rgba(220, 38, 38, 0.25)' : 'rgba(239, 68, 68, 0.35)',
                    background: isLight ? 'rgba(220, 38, 38, 0.03)' : 'rgba(239, 68, 68, 0.04)'
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: isLight ? '#b91c1c' : '#f87171',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <AlertCircle size={18} color={isLight ? '#dc2626' : '#ef4444'} />
                    <span>Errors Detected in Your Code ({result.errors.length})</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.errors.map((err, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.3)',
                          border: isLight ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid rgba(239, 68, 68, 0.25)',
                          boxShadow: isLight ? '0 1px 4px rgba(220, 38, 38, 0.06)' : undefined,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            className="badge-red"
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {err.type}
                          </span>
                          {err.line && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: isLight ? '#475569' : '#94a3b8',
                                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-code)'
                              }}
                            >
                              Line {err.line}
                            </span>
                          )}
                        </div>

                        <div style={{ color: isLight ? '#991b1b' : '#fca5a5', fontSize: '0.88rem', fontWeight: 600 }}>
                          {err.message}
                        </div>

                        {err.suggestion && (
                          <div style={{ color: isLight ? '#334155' : '#cbd5e1', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ChevronRight size={14} color={isLight ? '#4f46e5' : '#818cf8'} />
                            <span><strong style={{ color: isLight ? '#4f46e5' : '#818cf8' }}>Suggested Fix:</strong> {err.suggestion}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEST CASE EXECUTION BREAKDOWN */}
              {result?.testCases && result.testCases.length > 0 && (
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Terminal size={16} color="var(--primary)" />
                    <span>Test Suite Results</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {result.testCases.map((tc) => (
                      <div
                        key={tc.id}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.25)',
                          border: tc.passed
                            ? isLight
                              ? '1px solid rgba(5, 150, 105, 0.3)'
                              : '1px solid rgba(16, 185, 129, 0.3)'
                            : isLight
                            ? '1px solid rgba(220, 38, 38, 0.3)'
                            : '1px solid rgba(239, 68, 68, 0.3)',
                          boxShadow: isLight ? '0 1px 3px rgba(0, 0, 0, 0.05)' : undefined,
                          fontSize: '0.82rem',
                          fontFamily: 'var(--font-code)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Test Case #{tc.id}</span>
                          <span
                            className={tc.passed ? 'badge badge-green' : 'badge badge-red'}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {tc.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.78rem' }}>Input: {tc.input}</div>
                        <div style={{ color: isLight ? '#047857' : '#10b981', fontSize: '0.78rem' }}>Expected: {tc.expected}</div>
                        {!tc.passed && tc.actual && (
                          <div style={{ color: isLight ? '#b91c1c' : '#ef4444', fontSize: '0.78rem' }}>Actual: {tc.actual}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPILER EXECUTION TERMINAL OUTPUT */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Cpu size={16} color="#10b981" />
                  <span>Compiler Execution Console</span>
                </h3>

                <pre
                  className="sandbox-terminal"
                  style={{
                    color: result?.status === 'ACCEPTED' ? '#34d399' : '#f87171'
                  }}
                >
                  {result?.output}
                </pre>
              </div>

              {/* AI TIME & SPACE COMPLEXITY ANALYSIS */}
              <div className="glass-card glass-card-glow" style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} color="var(--primary)" />
                  <span>AI Complexity & Placement Code Review</span>
                </h3>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: isLight ? 'rgba(79, 70, 229, 0.05)' : 'rgba(99, 102, 241, 0.08)',
                    border: isLight ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)'
                  }}
                >
                  <pre
                    style={{
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-code)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {result?.aiComplexityReview}
                  </pre>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ================= 3. DISPLAY SOLUTION PANEL ("then display solution button to display solution") ================= */}
      {showSolution && (
        <div
          className="glass-card"
          style={{
            marginTop: '28px',
            padding: '28px',
            border: isLight ? '2px solid rgba(79, 70, 229, 0.3)' : '2px solid rgba(99, 102, 241, 0.4)',
            boxShadow: isLight ? '0 12px 35px rgba(79, 70, 229, 0.1)' : '0 0 30px rgba(99, 102, 241, 0.25)',
            background: isLight ? '#ffffff' : 'var(--bg-card)'
          }}
        >
          {/* Solution Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-card)',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={22} color={isLight ? '#d97706' : '#fbbf24'} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Optimal Reference Solution: {currentProblem.title}
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                Approach: <strong style={{ color: isLight ? '#4f46e5' : '#818cf8' }}>{currentProblem.solution.approach}</strong>
              </p>
            </div>

            {/* Complexity Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {currentProblem.solution.timeComplexity.split('-')[0].trim()}
              </span>
              <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                {currentProblem.solution.spaceComplexity.split('-')[0].trim()}
              </span>
            </div>
          </div>

          {/* Solution Body Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.2fr) minmax(300px, 0.8fr)', gap: '24px' }}>
            
            {/* Left: Solution Code */}
            <div>
              {/* Solution Language Switcher & Copy Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['java', 'python', 'cpp', 'javascript'] as const).map((langKey) => (
                    <button
                      key={langKey}
                      onClick={() => setSolutionLang(langKey)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: solutionLang === langKey ? 'var(--primary)' : isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                        color: solutionLang === langKey ? '#fff' : isLight ? '#475569' : 'var(--text-dim)',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid var(--border-card)',
                        cursor: 'pointer'
                      }}
                    >
                      {langKey.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopySolution}
                    className="sandbox-pill-btn"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {copiedSolution ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedSolution ? 'Copied' : 'Copy Solution'}</span>
                  </button>

                  <button
                    onClick={handleLoadSolutionToEditor}
                    className="sandbox-pill-btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: isLight ? '#4f46e5' : '#818cf8',
                      borderColor: isLight ? 'rgba(79, 70, 229, 0.3)' : 'rgba(99, 102, 241, 0.3)'
                    }}
                    title="Load this solution directly into the code editor"
                  >
                    <Code2 size={14} />
                    <span>Load into Editor</span>
                  </button>
                </div>
              </div>

              {/* Solution Code Block */}
              <pre
                className="sandbox-code-pre"
                style={{
                  maxHeight: '440px'
                }}
              >
                {currentProblem.solution.code[solutionLang] || 'Solution not available in this language'}
              </pre>
            </div>

            {/* Right: Step-by-step Intuition & Key Placement Takeaways */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Intuition & Algorithm Walkthrough:
                </h4>
                <div
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.7,
                    color: 'var(--text-muted)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {currentProblem.solution.explanation}
                </div>
              </div>

              {/* Key Placement Interview Takeaways */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: isLight ? 'rgba(5, 150, 105, 0.06)' : 'rgba(16, 185, 129, 0.08)',
                  border: isLight ? '1px solid rgba(5, 150, 105, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: isLight ? '#047857' : '#10b981', marginBottom: '8px' }}>
                  Campus Placement Key Takeaways:
                </h5>
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentProblem.solution.keyTakeaways.map((takeaway, i) => (
                    <li key={i} style={{ color: 'var(--text-main)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
