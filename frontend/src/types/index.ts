export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  targetRole: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: string;
  targetRole: string;
}

export interface Question {
  id: number;
  title: string;
  domain: string;
  difficulty: string;
  text: string;
  sampleAnswer: string;
  companyTag: string;
  expectedKeywords?: string;
}

export interface InterviewSession {
  id: number;
  userId: number;
  title: string;
  domain: string;
  difficulty: string;
  overallScore: number;
  status: string;
  createdAt: string;
}

export interface EvaluationResult {
  evaluationId: number;
  technicalScore: number;
  communicationScore: number;
  sentimentScore: number;
  overallScore: number;
  constructiveFeedback: string;
  idealAnswer: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  candidateAnswer?: string;
  audioUrl?: string;
  modelAnswerSimilarity?: number;
}

export interface ResumeAnalysis {
  atsScore: number;
  targetJobRole: string;
  extractedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  breakdown?: {
    keywordScore: number;
    impactScore: number;
    structureScore: number;
    lengthScore: number;
    matchedCount: number;
    totalTargetKeywords: number;
    metricCount: number;
    verbCount: number;
    wordCount: number;
  };
}

export interface CodeErrorDetail {
  line?: number;
  type: 'SyntaxError' | 'CompilationError' | 'RuntimeError' | 'LogicError' | 'Warning';
  message: string;
  suggestion?: string;
}

export interface TestCaseResult {
  id: number;
  input: string;
  expected: string;
  actual?: string;
  passed: boolean;
  explanation?: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemSolution {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  code: Record<string, string>;
  keyTakeaways: string[];
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
  domain: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: Record<string, string>;
  solution: ProblemSolution;
  testCases: Array<{
    id: number;
    input: string;
    expected: string;
    explanation?: string;
  }>;
}

export interface CodeExecutionResult {
  status: 'ACCEPTED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'WRONG_ANSWER';
  runtimeMs: number;
  output: string;
  aiComplexityReview: string;
  errors?: CodeErrorDetail[];
  testCases?: TestCaseResult[];
  solution?: ProblemSolution;
}

export interface DashboardMetrics {
  totalInterviews: number;
  averageScore: number;
  latestAtsScore: number;
  codingChallengesCompleted: number;
  domainScores: Record<string, number>;
  recentActivity: Array<{
    type: string;
    title: string;
    score: number;
    date: string;
  }>;
}

export type { AiCodingProblem, AiMcq } from '../data/aiCodingProblems';
export type { PromptEvaluation, AiChatMessage, AssessmentAuditRecord } from '../utils/aiPromptEvaluator';

