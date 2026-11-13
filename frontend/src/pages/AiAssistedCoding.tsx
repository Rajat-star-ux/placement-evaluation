import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Play,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Code2,
  HelpCircle,
  Award,
  Terminal,
  FileCode,
  Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  AI_CODING_PROBLEMS,
  AI_LITERACY_MCQS,
  type AiCodingProblem
} from '../data/aiCodingProblems';
import {
  evaluatePrompt,
  generateAiAssistantResponse,
  calculateAuditReport,
  type AiChatMessage,
  type AssessmentAuditRecord,
  type PromptEvaluation
} from '../utils/aiPromptEvaluator';
import { validateAndExecuteCode } from '../utils/codeValidator';
import { userPracticeStore } from '../utils/userPracticeStore';
import type { CodeExecutionResult } from '../types';

export const AiAssistedCoding: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Active section view
  const [activeMode, setActiveMode] = useState<'challenge' | 'mcq' | 'audit'>('challenge');

  // Problem & Language state
  const [selectedProblemId, setSelectedProblemId] = useState<string>(AI_CODING_PROBLEMS[0].id);
  const currentProblem: AiCodingProblem =
    AI_CODING_PROBLEMS.find(p => p.id === selectedProblemId) || AI_CODING_PROBLEMS[0];

  const [language, setLanguage] = useState<'java' | 'python' | 'cpp' | 'javascript'>('java');
  const [code, setCode] = useState<string>(currentProblem.starterCode['java'] || '');

  // Token budget & Chat state
  const [tokenBudget, setTokenBudget] = useState<number>(currentProblem.tokenBudget);
  const [tokensConsumed, setTokensConsumed] = useState<number>(0);
  const [promptInput, setPromptInput] = useState<string>('');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [currentPromptEval, setCurrentPromptEval] = useState<PromptEvaluation | null>(null);

  // Interaction tracking for audit
  const [acceptedCount, setAcceptedCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [manualEditsCount, setManualEditsCount] = useState<number>(0);

  // Execution & Test case states
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [leftTab, setLeftTab] = useState<'description' | 'testcases' | 'bugs'>('description');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // MCQ state
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [submittedMcq, setSubmittedMcq] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync state on problem / language change
  useEffect(() => {
    const initialCode = currentProblem.category === 'debugging' && currentProblem.buggyCode
      ? currentProblem.buggyCode[language] || currentProblem.starterCode[language]
      : currentProblem.starterCode[language] || '';

    setCode(initialCode);
    setExecutionResult(null);
    setHasExecuted(false);
    setTokenBudget(currentProblem.tokenBudget);
    setTokensConsumed(0);
    setAcceptedCount(0);
    setRejectedCount(0);
    setManualEditsCount(0);

    // Initial greeting from AI Copilot
    const welcomeTokens = 35;
    const initialMsg: AiChatMessage = {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am your AI Copilot for this Capgemini OA session.\n` +
        `You have a **${currentProblem.tokenBudget} Token Budget**. Specific prompts (mentioning constraints, time complexity, and data structures) will generate optimal code. How would you like to begin?`,
      tokensConsumed: welcomeTokens
    };
    setMessages([initialMsg]);
    setTokensConsumed(welcomeTokens);
  }, [selectedProblemId, language]);

  // Live prompt evaluation as candidate types
  useEffect(() => {
    if (promptInput.trim().length > 5) {
      setCurrentPromptEval(evaluatePrompt(promptInput, currentProblem));
    } else {
      setCurrentPromptEval(null);
    }
  }, [promptInput, currentProblem]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Handle Tab key in editor
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setManualEditsCount(prev => prev + 1);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Handle code change
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setManualEditsCount(prev => prev + 1);
  };

  // Send prompt to AI Copilot
  const handleSendPrompt = (promptTextToSend?: string) => {
    const text = promptTextToSend || promptInput;
    if (!text.trim() || isAiThinking) return;

    if (tokensConsumed >= tokenBudget) {
      alert('Token budget exhausted (2,000 / 2,000 used)! You must complete the challenge using manual code edits.');
      return;
    }

    const promptEval = evaluatePrompt(text, currentProblem);
    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text,
      evaluation: promptEval,
      tokensConsumed: promptEval.tokensEstimated
    };

    const newTokensTotal = tokensConsumed + promptEval.tokensEstimated;
    setMessages(prev => [...prev, userMsg]);
    setTokensConsumed(newTokensTotal);
    setPromptInput('');
    setIsAiThinking(true);

    // Simulate AI Copilot generation delay
    setTimeout(() => {
      const response = generateAiAssistantResponse(text, currentProblem, language, code);
      const assistantMsg: AiChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.replyText,
        suggestedCode: response.codeSuggestion,
        codeLanguage: language,
        tokensConsumed: response.tokens
      };

      setMessages(prev => [...prev, assistantMsg]);
      setTokensConsumed(prev => Math.min(tokenBudget, prev + response.tokens));
      setIsAiThinking(false);
    }, 750);
  };

  // Accept code suggested by AI
  const handleAcceptAiCode = (suggestedCode: string) => {
    setCode(suggestedCode);
    setAcceptedCount(prev => prev + 1);
    setExecutionResult(null);
    setHasExecuted(false);
  };

  // Reject code suggested by AI
  const handleRejectAiCode = () => {
    setRejectedCount(prev => prev + 1);
  };

  // Execute Code & Run Test Cases
  const handleRunCode = () => {
    setIsRunningCode(true);
    setHasExecuted(true);

    setTimeout(() => {
      const res = validateAndExecuteCode(
        {
          id: currentProblem.id,
          title: currentProblem.title,
          difficulty: currentProblem.difficulty,
          companyTags: currentProblem.companyTags,
          domain: 'AI-Assisted Coding',
          description: currentProblem.description,
          examples: currentProblem.examples,
          constraints: currentProblem.constraints,
          starterCode: currentProblem.starterCode,
          solution: currentProblem.solution,
          testCases: currentProblem.testCases
        },
        language,
        code
      );
      setExecutionResult(res);
      setIsRunningCode(false);

      // Record accepted challenge in user practice store for dashboard & performance report
      if (res.status === 'ACCEPTED') {
        userPracticeStore.recordCodingChallenge(currentProblem.title, currentProblem.id);
      }
    }, 600);
  };

  // Reset code to starter template
  const handleResetCode = () => {
    if (window.confirm('Reset code editor to initial template?')) {
      const initial = currentProblem.starterCode[language] || '';
      setCode(initial);
      setExecutionResult(null);
      setHasExecuted(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      alert('Failed to copy code');
    }
  };

  // Calculate audit report
  const passedCasesCount = executionResult?.testCases?.filter(t => t.passed).length || 0;
  const auditReport: AssessmentAuditRecord = calculateAuditReport(
    messages,
    tokenBudget,
    tokensConsumed,
    acceptedCount,
    rejectedCount,
    manualEditsCount,
    passedCasesCount,
    currentProblem.testCases.length
  );

  // Quick prompt chips
  const quickPrompts = [
    currentProblem.category === 'debugging'
      ? 'Diagnose the off-by-one boundary bugs and fix the sliding window calculation.'
      : 'Optimize this algorithm to O(N) linear time and O(N) space using a HashMap.',
    'Explain the algorithm approach and list critical edge cases.',
    `Provide production-ready ${language.toUpperCase()} code with boundary checks for empty or negative inputs.`,
    'Check if my current implementation handles all edge cases without throwing exceptions.'
  ];

  // Token percentage
  const tokenPercentage = Math.min(100, Math.round((tokensConsumed / tokenBudget) * 100));
  const tokenBarColor =
    tokenPercentage < 60 ? '#10b981' : tokenPercentage < 85 ? '#f59e0b' : '#ef4444';

  // Line count for editor
  const lineCount = Math.max(1, code.split('\n').length);

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Top Header & Capgemini Context */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)'
              }}
            >
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                AI-Assisted Coding Assessment
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Simulating Capgemini Exceller, Cognizant GenC Next & Amazon Next-Gen OA Patterns
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
              Capgemini Exceller Format
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
              Token Budget: 2,000 Limit
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
              Rubric: Process Over Code
            </span>
          </div>
        </div>

        {/* Token Budget Gauge & Mode Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          {/* Token Gauge */}
          <div
            style={{
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '10px 16px',
              minWidth: '240px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color={tokenBarColor} /> Token Budget
              </span>
              <span style={{ fontWeight: 700, color: tokenBarColor }}>
                {tokensConsumed} / {tokenBudget} ({100 - tokenPercentage}% left)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${tokenPercentage}%`,
                  height: '100%',
                  background: tokenBarColor,
                  borderRadius: '4px',
                  transition: 'width 0.3s ease, background 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveMode('challenge')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: activeMode === 'challenge' ? '1px solid #6366f1' : '1px solid var(--border-card)',
                background: activeMode === 'challenge' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeMode === 'challenge' ? '#6366f1' : 'var(--text-muted)'
              }}
            >
              <Code2 size={15} /> Coding Challenge
            </button>
            <button
              onClick={() => setActiveMode('mcq')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: activeMode === 'mcq' ? '1px solid #10b981' : '1px solid var(--border-card)',
                background: activeMode === 'mcq' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeMode === 'mcq' ? '#10b981' : 'var(--text-muted)'
              }}
            >
              <HelpCircle size={15} /> AI Literacy MCQs
            </button>
            <button
              onClick={() => setActiveMode('audit')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: activeMode === 'audit' ? '1px solid #ec4899' : '1px solid var(--border-card)',
                background: activeMode === 'audit' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                color: activeMode === 'audit' ? '#ec4899' : 'var(--text-muted)'
              }}
            >
              <Award size={15} /> Evaluation Audit
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MAIN CODING CHALLENGE */}
      {activeMode === 'challenge' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* ===================== LEFT COLUMN: PROBLEM SPEC & TEST CASES ===================== */}
          <div
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '760px',
              maxHeight: '820px',
              overflowY: 'auto'
            }}
          >
            {/* Problem Selector Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Challenge Module:
              </label>
              <select
                value={selectedProblemId}
                onChange={(e) => setSelectedProblemId(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-card)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {AI_CODING_PROBLEMS.map((prob) => (
                  <option key={prob.id} value={prob.id} style={{ background: isLight ? '#fff' : '#0f172a' }}>
                    {prob.category === 'debugging' ? '🐞 [Debugging] ' : prob.category === 'optimization' ? '⚡ [Optimization] ' : '🚀 [Algorithm] '}
                    {prob.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem Title & Tags */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: currentProblem.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: currentProblem.difficulty === 'Easy' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${currentProblem.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}
                >
                  {currentProblem.difficulty}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  Category: {currentProblem.category.toUpperCase()}
                </span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                {currentProblem.title}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentProblem.companyTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#818cf8',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Left Tabs: Description vs Test Cases vs Known Bugs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-card)', paddingBottom: '8px', marginBottom: '14px' }}>
              <button
                onClick={() => setLeftTab('description')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: leftTab === 'description' ? '#6366f1' : 'var(--text-muted)',
                  borderBottom: leftTab === 'description' ? '2px solid #6366f1' : 'none'
                }}
              >
                Description
              </button>
              <button
                onClick={() => setLeftTab('testcases')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: leftTab === 'testcases' ? '#6366f1' : 'var(--text-muted)',
                  borderBottom: leftTab === 'testcases' ? '2px solid #6366f1' : 'none'
                }}
              >
                Test Cases ({currentProblem.testCases.length})
              </button>
              {currentProblem.knownBugs && (
                <button
                  onClick={() => setLeftTab('bugs')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: leftTab === 'bugs' ? '#ef4444' : 'var(--text-muted)',
                    borderBottom: leftTab === 'bugs' ? '2px solid #ef4444' : 'none'
                  }}
                >
                  Bug Log 🐞
                </button>
              )}
            </div>

            {/* Tab 1: Description */}
            {leftTab === 'description' && (
              <div style={{ fontSize: '0.84rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <div style={{ whiteSpace: 'pre-line', marginBottom: '18px', color: 'var(--text-muted)' }}>
                  {currentProblem.description}
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Examples:
                  </h4>
                  {currentProblem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-dim)', fontSize: '0.76rem', marginBottom: '4px' }}>
                        Example {idx + 1}:
                      </div>
                      <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        <div><strong>Input:</strong> {ex.input}</div>
                        <div><strong>Output:</strong> {ex.output}</div>
                        {ex.explanation && (
                          <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                            <strong>Note:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Constraints:
                  </h4>
                  <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {currentProblem.constraints.map((c, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>
                        <code>{c}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Test Cases */}
            {leftTab === 'testcases' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Benchmark test cases evaluated during assessment submission:
                </p>
                {currentProblem.testCases.map((tc) => (
                  <div
                    key={tc.id}
                    style={{
                      background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: '#6366f1' }}>Test Case #{tc.id}</span>
                      {tc.explanation && (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>{tc.explanation}</span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.76rem' }}>
                      <div><strong style={{ color: 'var(--text-muted)' }}>Input:</strong> {tc.input}</div>
                      <div><strong style={{ color: 'var(--text-muted)' }}>Expected:</strong> {tc.expected}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Known Bugs (Debugging challenge) */}
            {leftTab === 'bugs' && currentProblem.knownBugs && (
              <div>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    marginBottom: '14px'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                    🐞 Fault Injection Notice:
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    This challenge contains deliberate runtime/boundary bugs. Prompt the AI Copilot to diagnose and fix them.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentProblem.knownBugs.map((bug, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-card)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>Bug #{i + 1}:</span>
                      <span style={{ color: 'var(--text-main)' }}>{bug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===================== CENTER COLUMN: CODE EDITOR & EXECUTION ===================== */}
          <div
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '760px',
              maxHeight: '820px'
            }}
          >
            {/* Editor Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={16} color="#6366f1" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Candidate Solution
                </span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-card)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="java">Java (JDK 17+)</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (G++ 11)</option>
                  <option value="javascript">JavaScript (Node.js)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={handleCopyCode}
                  title="Copy Code"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleResetCode}
                  title="Reset Template"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Code Editor with Line Numbers */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                background: isLight ? '#f8fafc' : '#070a13',
                border: '1px solid var(--border-card)',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative',
                minHeight: '340px'
              }}
            >
              {/* Line Numbers */}
              <div
                style={{
                  padding: '12px 8px',
                  background: isLight ? '#f1f5f9' : '#0b0f19',
                  borderRight: '1px solid var(--border-card)',
                  color: isLight ? '#94a3b8' : '#475569',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.78rem',
                  lineHeight: '1.5',
                  textAlign: 'right',
                  userSelect: 'none',
                  minWidth: '38px'
                }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea Code Input */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleEditorKeyDown}
                spellCheck={false}
                placeholder="Write your code or insert suggestions from the AI Copilot..."
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: isLight ? '#0f172a' : '#e2e8f0',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                  resize: 'none',
                  whiteSpace: 'pre',
                  overflowY: 'auto'
                }}
              />
            </div>

            {/* Run Button Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '12px 0'
              }}
            >
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Manual Edits: <strong>{manualEditsCount}</strong> | Accepted Suggestions: <strong>{acceptedCount}</strong>
              </span>

              <button
                onClick={handleRunCode}
                disabled={isRunningCode}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: isRunningCode ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  opacity: isRunningCode ? 0.7 : 1
                }}
              >
                <Play size={16} fill="#ffffff" />
                <span>{isRunningCode ? 'Evaluating...' : 'Run & Test Solution'}</span>
              </button>
            </div>

            {/* Test Results Console */}
            <div
              style={{
                height: '220px',
                background: isLight ? '#f1f5f9' : '#05070e',
                border: '1px solid var(--border-card)',
                borderRadius: '10px',
                padding: '12px',
                overflowY: 'auto',
                fontFamily: 'var(--font-code)',
                fontSize: '0.76rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-card)', paddingBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <Terminal size={14} /> Execution Console & Test Suite
                </span>
                {executionResult && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: executionResult.status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: executionResult.status === 'ACCEPTED' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {executionResult.status} ({executionResult.runtimeMs} ms)
                  </span>
                )}
              </div>

              {!hasExecuted && (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '40px' }}>
                  Click <strong>Run & Test Solution</strong> to verify your code against benchmark test cases.
                </div>
              )}

              {hasExecuted && executionResult && (
                <div>
                  {/* Test case breakdown badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {executionResult.testCases?.map((tc) => (
                      <div
                        key={tc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: tc.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${tc.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: tc.passed ? '#10b981' : '#ef4444',
                          fontSize: '0.72rem'
                        }}
                      >
                        {tc.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>Case #{tc.id}: {tc.passed ? 'Passed' : 'Failed'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Output message */}
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0,
                      color: executionResult.status === 'ACCEPTED' ? (isLight ? '#065f46' : '#34d399') : (isLight ? '#991b1b' : '#f87171')
                    }}
                  >
                    {executionResult.output}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* ===================== RIGHT COLUMN: AI COPILOT & PROMPT AUDIT ===================== */}
          <div
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '760px',
              maxHeight: '820px'
            }}
          >
            {/* Copilot Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-card)',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} color="#6366f1" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  AI Copilot Chat
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                Tokens: {tokensConsumed} / {tokenBudget}
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Suggested Prompts for this challenge:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {quickPrompts.slice(0, 2).map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(chip)}
                    disabled={isAiThinking || tokensConsumed >= tokenBudget}
                    style={{
                      textAlign: 'left',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: isLight ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: isLight ? '#4338ca' : '#a5b4fc',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={13} color="#6366f1" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Message Stream */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingRight: '4px',
                marginBottom: '12px'
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    background: msg.sender === 'user'
                      ? (isLight ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.2)')
                      : (isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.7)'),
                    border: msg.sender === 'user'
                      ? '1px solid rgba(99, 102, 241, 0.35)'
                      : '1px solid var(--border-card)',
                    borderRadius: '12px',
                    padding: '10px 14px'
                  }}
                >
                  {/* Sender & Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: msg.sender === 'user' ? '#6366f1' : '#ec4899'
                      }}
                    >
                      {msg.sender === 'user' ? 'Candidate Prompt' : 'AI Assistant'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      {msg.timestamp} ({msg.tokensConsumed} tokens)
                    </span>
                  </div>

                  {/* Prompt Quality Evaluation Badge (for user prompts) */}
                  {msg.evaluation && (
                    <div
                      style={{
                        marginBottom: '6px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: msg.evaluation.rating === 'Excellent'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : msg.evaluation.rating === 'Good'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid var(--border-card)',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Quality: {msg.evaluation.rating} ({msg.evaluation.score}/100)</span>
                      {msg.evaluation.detectedKeywords.length > 0 && (
                        <span style={{ color: 'var(--text-dim)' }}>
                          ✓ {msg.evaluation.detectedKeywords.join(', ')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Text */}
                  <div
                    style={{
                      fontSize: '0.8rem',
                      lineHeight: '1.5',
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Suggested Code Block inside message */}
                  {msg.suggestedCode && (
                    <div style={{ marginTop: '10px' }}>
                      <div
                        style={{
                          background: isLight ? '#0f172a' : '#070a13',
                          borderRadius: '8px',
                          padding: '10px',
                          border: '1px solid var(--border-card)',
                          maxHeight: '160px',
                          overflowY: 'auto',
                          fontFamily: 'var(--font-code)',
                          fontSize: '0.74rem',
                          color: '#38bdf8'
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: 'pre' }}>{msg.suggestedCode}</pre>
                      </div>

                      {/* Accept / Reject Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleAcceptAiCode(msg.suggestedCode!)}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={13} />
                          <span>Insert Code into Editor</span>
                        </button>
                        <button
                          onClick={handleRejectAiCode}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: '1px solid var(--border-card)',
                            color: 'var(--text-muted)',
                            fontSize: '0.74rem',
                            cursor: 'pointer'
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isAiThinking && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: isLight ? '#f1f5f9' : 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-card)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={15} color="#ec4899" className="animate-spin" />
                  <span>AI Copilot is generating response...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Live Prompt Quality Meter (Before sending) */}
            {currentPromptEval && (
              <div
                style={{
                  marginBottom: '8px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-card)',
                  fontSize: '0.72rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                  <span>Live Prompt Quality: <strong>{currentPromptEval.rating}</strong> ({currentPromptEval.score}/100)</span>
                  <span style={{ color: 'var(--text-dim)' }}>~{currentPromptEval.tokensEstimated} tokens</span>
                </div>
                {currentPromptEval.feedback.length > 0 && (
                  <div style={{ color: '#f59e0b', fontSize: '0.7rem' }}>
                    {currentPromptEval.feedback[0]}
                  </div>
                )}
              </div>
            )}

            {/* Prompt Input Box */}
            <div style={{ position: 'relative' }}>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                disabled={tokensConsumed >= tokenBudget}
                placeholder={
                  tokensConsumed >= tokenBudget
                    ? 'Token budget exhausted (2000/2000 used).'
                    : 'Prompt AI Copilot (e.g. "Optimize to O(N) using HashMap with negative value handling")...'
                }
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 12px',
                  borderRadius: '10px',
                  background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-card)',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={!promptInput.trim() || isAiThinking || tokensConsumed >= tokenBudget}
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: promptInput.trim() && tokensConsumed < tokenBudget
                    ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: promptInput.trim() && tokensConsumed < tokenBudget ? 'pointer' : 'not-allowed'
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AI LITERACY MCQS (Capgemini OA Part 1) */}
      {activeMode === 'mcq' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-card)', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              Capgemini Exceller: AI Literacy & Prompting Concepts
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              Recent campus placement technical assessments feature 15-20 MCQs on Generative AI, Prompt Engineering, Hallucination Prevention, and Copilot verification.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {AI_LITERACY_MCQS.map((mcq, idx) => {
              const selectedOpt = mcqAnswers[mcq.id];
              const isCorrect = selectedOpt === mcq.correctIndex;
              return (
                <div
                  key={mcq.id}
                  style={{
                    background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '12px',
                    padding: '18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1' }}>
                      Question {idx + 1} • {mcq.category}
                    </span>
                    {submittedMcq && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isCorrect ? '#10b981' : '#ef4444'
                        }}
                      >
                        {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 12px 0' }}>
                    {mcq.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mcq.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      let optBg = isLight ? '#f8fafc' : 'rgba(30, 41, 59, 0.5)';
                      let optBorder = 'var(--border-card)';
                      let optColor = 'var(--text-main)';

                      if (submittedMcq) {
                        if (optIdx === mcq.correctIndex) {
                          optBg = 'rgba(16, 185, 129, 0.15)';
                          optBorder = 'rgba(16, 185, 129, 0.4)';
                          optColor = '#10b981';
                        } else if (isChosen && !isCorrect) {
                          optBg = 'rgba(239, 68, 68, 0.15)';
                          optBorder = 'rgba(239, 68, 68, 0.4)';
                          optColor = '#ef4444';
                        }
                      } else if (isChosen) {
                        optBg = 'rgba(99, 102, 241, 0.12)';
                        optBorder = 'rgba(99, 102, 241, 0.4)';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submittedMcq}
                          onClick={() => setMcqAnswers(prev => ({ ...prev, [mcq.id]: optIdx }))}
                          style={{
                            textAlign: 'left',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: optBg,
                            border: `1px solid ${optBorder}`,
                            color: optColor,
                            fontSize: '0.82rem',
                            cursor: submittedMcq ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: `1px solid ${optBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submittedMcq && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-card)',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <strong style={{ color: '#6366f1' }}>Explanation: </strong>
                      {mcq.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit MCQ Quiz Button */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {submittedMcq ? (
              <button
                onClick={() => {
                  setSubmittedMcq(false);
                  setMcqAnswers({});
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset Quiz
              </button>
            ) : (
              <button
                onClick={() => setSubmittedMcq(true)}
                disabled={Object.keys(mcqAnswers).length === 0}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: Object.keys(mcqAnswers).length > 0 ? 'pointer' : 'not-allowed',
                  opacity: Object.keys(mcqAnswers).length > 0 ? 1 : 0.6
                }}
              >
                Submit Answers ({Object.keys(mcqAnswers).length} / {AI_LITERACY_MCQS.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: ASSESSMENT AUDIT REPORT (Capgemini OA Part 3) */}
      {activeMode === 'audit' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-card)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  Candidate Assessment Audit & Rubric Breakdown
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                  Evaluated using Capgemini Exceller's 4-Pillar Process-Over-Output Rubric
                </p>
              </div>

              <div
                style={{
                  textAlign: 'right',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: auditReport.overallScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: `1px solid ${auditReport.overallScore >= 80 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Overall Score
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: auditReport.overallScore >= 80 ? '#10b981' : '#f59e0b' }}>
                  {auditReport.overallScore} / 100
                </div>
              </div>
            </div>
          </div>

          {/* 4-Pillar Rubric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {/* Pillar 1 */}
            <div
              style={{
                background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>Weight: 30%</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                Prompt Engineering
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' }}>
                {auditReport.rubricBreakdown.promptEngineering}%
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                Specificity of constraints, complexity targets & data structures.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>Weight: 25%</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                Code Review & Verification
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                {auditReport.rubricBreakdown.codeReview}%
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                Diligence in reviewing, manually editing, or dismissing flawed AI code.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>Weight: 25%</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                Token Economy
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
                {auditReport.rubricBreakdown.tokenEfficiency}%
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                Tokens conserved within the 2,000 budget limit.
              </p>
            </div>

            {/* Pillar 4 */}
            <div
              style={{
                background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>Weight: 20%</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                Final Correctness
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ec4899' }}>
                {auditReport.rubricBreakdown.finalCorrectness}%
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                Passing rate across benchmark interview test cases.
              </p>
            </div>
          </div>

          {/* Summary Feedback Callout */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '24px'
            }}
          >
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6366f1', margin: '0 0 6px 0' }}>
              Assessment Feedback Summary:
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
              {auditReport.summaryFeedback}
            </p>
          </div>

          {/* Interaction Metrics Table */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              Interaction Audit Trail:
            </h4>
            <div
              style={{
                background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-card)',
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f1f5f9' : '#0b0f19', borderBottom: '1px solid var(--border-card)' }}>
                    <th style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>Metric</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>Value Recorded</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>Benchmark Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
                    <td style={{ padding: '10px 14px' }}>Total Prompts Sent</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{auditReport.totalPrompts}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>2 - 6 Targeted Prompts</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
                    <td style={{ padding: '10px 14px' }}>Tokens Consumed / Remaining</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{auditReport.tokensConsumed} / {auditReport.tokensRemaining}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>&lt; 1,600 Tokens (Budget: 2,000)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
                    <td style={{ padding: '10px 14px' }}>Manual Code Edits</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{auditReport.manualEditsCount}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>&gt; 5 manual verification keystrokes</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
                    <td style={{ padding: '10px 14px' }}>AI Suggestions Accepted / Dismissed</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{auditReport.acceptedSuggestionsCount} / {auditReport.rejectedSuggestionsCount}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Selective acceptance (avoid blind acceptance)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px' }}>Test Cases Passed</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{auditReport.testCasesPassed} / {auditReport.totalTestCases}</td>
                    <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 600 }}>100% Passed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
