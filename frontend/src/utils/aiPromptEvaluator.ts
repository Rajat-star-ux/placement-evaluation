import type { AiCodingProblem } from '../data/aiCodingProblems';

export interface PromptEvaluation {
  score: number; // 0 - 100
  rating: 'Vague' | 'Fair' | 'Good' | 'Excellent';
  feedback: string[];
  tokensEstimated: number;
  detectedKeywords: string[];
  hasComplexityTarget: boolean;
  hasDataStructureMention: boolean;
  hasEdgeCaseMention: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  suggestedCode?: string;
  codeLanguage?: string;
  evaluation?: PromptEvaluation;
  tokensConsumed: number;
}

export interface AssessmentAuditRecord {
  totalPrompts: number;
  averagePromptScore: number;
  tokensConsumed: number;
  tokensRemaining: number;
  acceptedSuggestionsCount: number;
  rejectedSuggestionsCount: number;
  manualEditsCount: number;
  testCasesPassed: number;
  totalTestCases: number;
  overallScore: number; // 0 - 100
  rubricBreakdown: {
    promptEngineering: number; // 30%
    codeReview: number;        // 25%
    tokenEfficiency: number;   // 25%
    finalCorrectness: number;  // 20%
  };
  summaryFeedback: string;
}

/**
 * Approximate token count for a text string (~1 token per 3.8 characters or 0.75 words)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charTokens = Math.ceil(text.length / 4);
  const wordTokens = Math.ceil(wordCount * 1.3);
  return Math.max(charTokens, wordTokens, 2);
}

/**
 * Evaluates the quality of a candidate's prompt according to Capgemini OA standards
 */
export function evaluatePrompt(prompt: string, problem: AiCodingProblem): PromptEvaluation {
  const clean = prompt.toLowerCase();
  const feedback: string[] = [];
  const detectedKeywords: string[] = [];
  let score = 30; // base score

  // Problem specific checks
  if (problem.category === 'debugging' && (clean.includes('bug') || clean.includes('boundary') || clean.includes('index') || clean.includes('off by one'))) {
    score += 15;
    detectedKeywords.push('Bug Diagnosis Specifics');
  } else if (problem.category === 'optimization' && (clean.includes('sliding') || clean.includes('window') || clean.includes('o(n)'))) {
    score += 15;
    detectedKeywords.push('Optimization Target');
  }

  // 1. Check length
  if (prompt.trim().length < 15) {
    feedback.push('Prompt is too brief. Specify problem requirements and target data structures.');
    score = Math.min(score, 25);
  } else if (prompt.trim().length >= 40) {
    score += 15;
  }

  // 2. Check for Time/Space Complexity mentions
  const complexityTerms = ['o(n)', 'o(1)', 'o(log', 'o(n^2)', 'time complexity', 'space complexity', 'linear time', 'constant space', 'optimal'];
  const hasComplexity = complexityTerms.some(term => clean.includes(term));
  if (hasComplexity) {
    score += 20;
    detectedKeywords.push('Complexity Target');
  } else {
    feedback.push('Tip: Mention explicit time/space complexity constraints (e.g., "O(N) time and O(N) space").');
  }

  // 3. Check for Data Structure / Algorithmic approaches
  const dsTerms = ['hashmap', 'hash map', 'hash table', 'map', 'set', 'sliding window', 'two pointer', 'prefix sum', 'array', 'frequency'];
  const hasDS = dsTerms.some(term => clean.includes(term));
  if (hasDS) {
    score += 20;
    detectedKeywords.push('Data Structure Strategy');
  } else {
    feedback.push('Tip: Guide the AI on preferred data structure (e.g. "using a HashMap" or "sliding window").');
  }

  // 4. Check for Edge Cases mentions
  const edgeTerms = ['edge case', 'negative', 'empty', 'null', 'duplicate', 'overflow', 'zero', 'single element', 'boundary', 'bounds'];
  const hasEdge = edgeTerms.some(term => clean.includes(term));
  if (hasEdge) {
    score += 15;
    detectedKeywords.push('Edge Case Awareness');
  } else {
    feedback.push('Tip: Mention critical edge cases (e.g. negative numbers, empty arrays, single element bounds).');
  }

  // 5. Check for language specificity
  const langTerms = ['java', 'python', 'c++', 'cpp', 'javascript', 'js'];
  if (langTerms.some(t => clean.includes(t))) {
    score += 10;
    detectedKeywords.push('Language Specified');
  }

  // Clamp score
  const finalScore = Math.min(100, Math.max(15, score));
  let rating: PromptEvaluation['rating'] = 'Vague';
  if (finalScore >= 80) rating = 'Excellent';
  else if (finalScore >= 60) rating = 'Good';
  else if (finalScore >= 40) rating = 'Fair';

  return {
    score: finalScore,
    rating,
    feedback,
    tokensEstimated: estimateTokens(prompt),
    detectedKeywords,
    hasComplexityTarget: hasComplexity,
    hasDataStructureMention: hasDS,
    hasEdgeCaseMention: hasEdge
  };
}

/**
 * Simulates intelligent AI assistant response matching Capgemini Copilot behavior
 */
export function generateAiAssistantResponse(
  prompt: string,
  problem: AiCodingProblem,
  language: 'java' | 'python' | 'cpp' | 'javascript',
  _currentCode: string
): { replyText: string; codeSuggestion?: string; tokens: number } {
  const evalResult = evaluatePrompt(prompt, problem);
  const clean = prompt.toLowerCase();
  const solutionCode = problem.solution.code[language] || '';

  // Case 1: Bug fixing / debugging request
  if (clean.includes('bug') || clean.includes('fix') || clean.includes('diagnose') || clean.includes('error') || clean.includes('failing')) {
    if (problem.category === 'debugging') {
      const bugDetails = problem.knownBugs?.map((b, i) => `${i + 1}. ${b}`).join('\n') || '';
      return {
        replyText: `I analyzed your code and identified the following root causes:\n\n${bugDetails}\n\nHere is the corrected sliding window implementation with proper boundary guards:`,
        codeSuggestion: solutionCode,
        tokens: estimateTokens(bugDetails + solutionCode) + 80
      };
    } else {
      return {
        replyText: `Reviewing your code against test cases:\n1. Ensure all boundary cases are guarded (empty inputs, length < 1).\n2. Verify the accumulator updates. Here is a corrected implementation in ${language.toUpperCase()}:`,
        codeSuggestion: solutionCode,
        tokens: estimateTokens(solutionCode) + 60
      };
    }
  }

  // Case 2: Code optimization request
  if (clean.includes('optimize') || clean.includes('complexity') || clean.includes('faster') || clean.includes('o(n)')) {
    return {
      replyText: `To optimize this from brute force to ${problem.solution.timeComplexity} time complexity and ${problem.solution.spaceComplexity} space complexity:\n\n` +
        `**Strategy:** ${problem.solution.approach}\n\n` +
        `**Complexity Breakdown:**\n- Time: ${problem.solution.timeComplexity}\n- Space: ${problem.solution.spaceComplexity}\n\n` +
        `Here is the optimized solution:`,
      codeSuggestion: solutionCode,
      tokens: estimateTokens(solutionCode) + 110
    };
  }

  // Case 3: Explanation / approach request
  if (clean.includes('explain') || clean.includes('how to solve') || clean.includes('approach') || clean.includes('algorithm')) {
    const text = `### Solution Strategy for "${problem.title}"\n\n` +
      `**Core Concept:** ${problem.solution.approach}\n\n` +
      `**Algorithm Steps:**\n` +
      `1. Initialize data structures with required base state.\n` +
      `2. Iterate through input elements in a single pass.\n` +
      `3. Maintain running statistics or window bounds.\n` +
      `4. Check edge constraints: empty input, negative numbers.\n\n` +
      `**Takeaways:**\n` + problem.solution.keyTakeaways.map(t => `- ${t}`).join('\n') +
      `\n\nWould you like me to generate the full code in ${language.toUpperCase()}?`;
    return {
      replyText: text,
      tokens: estimateTokens(text) + 40
    };
  }

  // Case 4: Vague prompt (poor score) - AI provides partial/scaffold code or prompts for clarity
  if (evalResult.rating === 'Vague') {
    const replyText = `Your prompt is quite generic ("${prompt}"). In an AI-assisted OA, specific prompts yield optimal code.\n\n` +
      `Here is a basic structure. Please specify:\n` +
      `1. Target time and space complexity\n` +
      `2. How to handle negative numbers or empty collections\n` +
      `3. Desired helper data structures (e.g. HashMap vs Two Pointers)`;
    
    // Provide starter or basic scaffold
    const starter = problem.starterCode[language] || '';
    return {
      replyText,
      codeSuggestion: starter,
      tokens: estimateTokens(replyText + starter) + 30
    };
  }

  // Case 5: Good or Excellent Prompt - full optimal code with detailed inline explanations
  const intro = evalResult.rating === 'Excellent'
    ? `Excellent prompt! You clearly specified requirements (${evalResult.detectedKeywords.join(', ')}). Here is the optimized, production-ready solution in ${language.toUpperCase()}:`
    : `Here is the solution based on your request:`;

  return {
    replyText: `${intro}\n\nKey Highlights:\n- Time Complexity: ${problem.solution.timeComplexity}\n- Space Complexity: ${problem.solution.spaceComplexity}\n- Verified against problem constraints.`,
    codeSuggestion: solutionCode,
    tokens: estimateTokens(solutionCode) + 95
  };
}

/**
 * Calculates candidate's overall assessment audit score following Capgemini Exceller criteria:
 * - 30% Prompt Engineering (average prompt quality score)
 * - 25% Code Review & Verification (did they inspect, test, edit?)
 * - 25% Token Efficiency (tokens used vs budget)
 * - 20% Correctness (test cases passed)
 */
export function calculateAuditReport(
  messages: AiChatMessage[],
  tokenBudget: number,
  tokensConsumed: number,
  acceptedSuggestions: number,
  rejectedSuggestions: number,
  manualEdits: number,
  passedCases: number,
  totalCases: number
): AssessmentAuditRecord {
  // 1. Prompt Engineering score
  const userPrompts = messages.filter(m => m.sender === 'user' && m.evaluation);
  const avgPromptScore = userPrompts.length > 0
    ? Math.round(userPrompts.reduce((acc, m) => acc + (m.evaluation?.score || 50), 0) / userPrompts.length)
    : 40;

  // 2. Token Efficiency score (remaining tokens ratio, penalized if exhausted)
  const remaining = Math.max(0, tokenBudget - tokensConsumed);
  let tokenScore = 100;
  if (tokensConsumed > tokenBudget) {
    tokenScore = 20; // exhausted budget
  } else {
    // Ideal usage is 30% - 70% of budget
    const usageRatio = tokensConsumed / tokenBudget;
    if (usageRatio < 0.15) tokenScore = 70; // barely used AI copilot
    else if (usageRatio <= 0.75) tokenScore = 95; // efficient
    else tokenScore = 80; // heavy usage
  }

  // 3. Code Review & Verification score
  // Candidates who manually edit, reject poor suggestions, or review suggestions get higher scores
  let reviewScore = 60;
  if (manualEdits > 0) reviewScore += 20;
  if (acceptedSuggestions > 0) reviewScore += 10;
  if (rejectedSuggestions > 0) reviewScore += 10;
  reviewScore = Math.min(100, reviewScore);

  // 4. Correctness score
  const passRatio = totalCases > 0 ? passedCases / totalCases : 0;
  const correctnessScore = Math.round(passRatio * 100);

  // Weighted total
  const finalScore = Math.round(
    avgPromptScore * 0.30 +
    reviewScore * 0.25 +
    tokenScore * 0.25 +
    correctnessScore * 0.20
  );

  let summaryFeedback = '';
  if (finalScore >= 85) {
    summaryFeedback = 'Outstanding performance! You demonstrated senior-level AI pair programming skills: highly targeted prompts, prudent token budgeting, thorough manual code review, and 100% test case verification.';
  } else if (finalScore >= 70) {
    summaryFeedback = 'Solid performance. Good prompting and test verification. Consider providing more explicit algorithmic constraints (time/space complexity) early on to conserve tokens.';
  } else {
    summaryFeedback = 'Needs improvement. Focus on prompt specificity (mention data structures, edge cases), avoid vague requests, and make sure to manually inspect and verify code against all test cases.';
  }

  return {
    totalPrompts: userPrompts.length,
    averagePromptScore: avgPromptScore,
    tokensConsumed,
    tokensRemaining: remaining,
    acceptedSuggestionsCount: acceptedSuggestions,
    rejectedSuggestionsCount: rejectedSuggestions,
    manualEditsCount: manualEdits,
    testCasesPassed: passedCases,
    totalTestCases: totalCases,
    overallScore: finalScore,
    rubricBreakdown: {
      promptEngineering: avgPromptScore,
      codeReview: reviewScore,
      tokenEfficiency: tokenScore,
      finalCorrectness: correctnessScore
    },
    summaryFeedback
  };
}
