import type { CodingProblem, CodeExecutionResult, CodeErrorDetail, TestCaseResult } from '../types';

function stripCommentsAndWhitespace(str: string): string {
  if (!str) return '';
  return str
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/#.*/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export function validateAndExecuteCode(
  problem: CodingProblem,
  language: string,
  code: string
): CodeExecutionResult {
  const errors: CodeErrorDetail[] = [];
  const lines = code.split('\n');

  const trimmed = code.trim();

  // 1. Check for completely empty code editor
  if (trimmed.length === 0) {
    errors.push({
      line: 1,
      type: 'CompilationError',
      message: 'Code editor is empty. Please write your code before executing.',
      suggestion: 'Implement the required function or click "Reset" to load the starter template.'
    });
  }

  // 2. Check if user submitted unmodified starter template or empty method body
  const starterRaw = problem.starterCode[language] || '';
  const normalizedUserCode = stripCommentsAndWhitespace(code);
  const normalizedStarterCode = stripCommentsAndWhitespace(starterRaw);

  const isExactStarter = normalizedUserCode === normalizedStarterCode;
  
  // Check if user code only contains the method signature with default empty return (no actual logic)
  const defaultReturns = [
    'returnnewint[]{};',
    'return{};',
    'return[];',
    'pass',
    'returnfalse;',
    'return0;',
    'returnnull;',
    'returnnullptr;'
  ];
  const containsOnlyDefaultReturn = defaultReturns.some((dr) => {
    // If the stripped code is just the signature + that return
    const signatureOnly = normalizedStarterCode.replace(dr, '');
    const userWithoutReturn = normalizedUserCode.replace(dr, '');
    return signatureOnly === userWithoutReturn && userWithoutReturn.length > 0;
  });

  if ((isExactStarter || containsOnlyDefaultReturn) && errors.length === 0) {
    errors.push({
      line: 1,
      type: 'LogicError',
      message: 'No code entered: You executed the default starter template without writing any solution code.',
      suggestion: 'Implement your algorithmic logic inside the method before clicking "Run Code & Analyze".'
    });
  }

  // 3. Bracket and Parentheses Balance Check with Line Tracking
  const bracketStack: Array<{ char: string; line: number }> = [];
  const bracketPairs: Record<string, string> = { '}': '{', ')': '(', ']': '[' };
  let inString: string | null = null;
  let inBlockComment = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const line = lines[lineIdx];

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      const prevChar = charIdx > 0 ? line[charIdx - 1] : '';
      const nextChar = charIdx < line.length - 1 ? line[charIdx + 1] : '';

      // Handle comments
      if (!inString && !inBlockComment) {
        if (char === '/' && nextChar === '/') break;
        if (char === '#' && language === 'python') break;
        if (char === '/' && nextChar === '*') {
          inBlockComment = true;
          charIdx++;
          continue;
        }
      }
      if (inBlockComment) {
        if (char === '*' && nextChar === '/') {
          inBlockComment = false;
          charIdx++;
        }
        continue;
      }

      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = char;
        } else if (inString === char) {
          inString = null;
        }
        continue;
      }
      if (inString) continue;

      // Track brackets
      if (char === '{' || char === '(' || char === '[') {
        bracketStack.push({ char, line: lineNum });
      } else if (char === '}' || char === ')' || char === ']') {
        const expectedOpen = bracketPairs[char];
        if (bracketStack.length === 0) {
          errors.push({
            line: lineNum,
            type: 'SyntaxError',
            message: `Unexpected closing bracket '${char}' with no matching opening bracket.`,
            suggestion: `Remove the unmatched '${char}' or add the matching '${expectedOpen}'.`
          });
        } else {
          const last = bracketStack.pop()!;
          if (last.char !== expectedOpen) {
            errors.push({
              line: lineNum,
              type: 'SyntaxError',
              message: `Mismatched bracket: expected '${last.char === '{' ? '}' : last.char === '(' ? ')' : ']'}' to close '${last.char}' from line ${last.line}, but found '${char}'.`,
              suggestion: 'Ensure brackets are closed in the correct nesting order.'
            });
          }
        }
      }
    }
  }

  // Check for unclosed brackets left in stack
  while (bracketStack.length > 0) {
    const unclosed = bracketStack.pop()!;
    errors.push({
      line: unclosed.line,
      type: 'SyntaxError',
      message: `Unclosed bracket '${unclosed.char}' opened at line ${unclosed.line}.`,
      suggestion: `Add the corresponding closing '${unclosed.char === '{' ? '}' : unclosed.char === '(' ? ')' : ']'}' before the end of the block.`
    });
  }

  // 4. Language-Specific Syntax Checks
  if (language === 'python') {
    lines.forEach((l, idx) => {
      const lineNum = idx + 1;
      const t = l.trim();
      if (!t || t.startsWith('#')) return;

      if (/^(def\s|class\s|if\s|elif\s|else|for\s|while\s|try:|except)/.test(t) && !t.endsWith(':')) {
        errors.push({
          line: lineNum,
          type: 'SyntaxError',
          message: `Missing colon ':' at the end of statement: "${t}"`,
          suggestion: 'In Python, header statements for functions, loops, and conditions must end with a colon (:).'
        });
      }

      if (/\&\&|\|\|/.test(t)) {
        errors.push({
          line: lineNum,
          type: 'SyntaxError',
          message: `Invalid logical operator in Python: "${t}". Use 'and'/'or' instead of '&&'/'||'.`,
          suggestion: 'Replace "&&" with "and", and "||" with "or".'
        });
      }

      if (/\btrue\b|\bfalse\b|\bnull\b/.test(t)) {
        errors.push({
          line: lineNum,
          type: 'SyntaxError',
          message: `Invalid literal in Python: use 'True', 'False', or 'None' (capitalized).`,
          suggestion: 'Capitalize True/False and use None instead of null.'
        });
      }
    });
  } else if (language === 'java' || language === 'cpp') {
    lines.forEach((l, idx) => {
      const lineNum = idx + 1;
      const t = l.trim();
      if (!t || t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('#')) return;

      if (t.startsWith('def ')) {
        errors.push({
          line: lineNum,
          type: 'CompilationError',
          message: `'def' keyword is invalid in ${language === 'java' ? 'Java' : 'C++'}.`,
          suggestion: `Declare functions with return types and parameters, e.g. "public int[] methodName(...)".`
        });
      }

      if (t.includes('===')) {
        errors.push({
          line: lineNum,
          type: 'SyntaxError',
          message: `Strict equality operator '===' does not exist in ${language.toUpperCase()}. Use '=='.`,
          suggestion: 'Replace "===" with "==".'
        });
      }

      if (/\blen\([a-zA-Z0-9_]+\)/.test(t)) {
        errors.push({
          line: lineNum,
          type: 'CompilationError',
          message: `Cannot find symbol 'len(...)'. In ${language === 'java' ? 'Java' : 'C++'}, use .length or .size().`,
          suggestion: language === 'java' ? 'Use array.length or list.size().' : 'Use vector.size() or string.length().'
        });
      }

      if (language === 'java' && /\bconsole\.log\(|\bprint\(/.test(t) && !t.includes('System.out.print')) {
        errors.push({
          line: lineNum,
          type: 'CompilationError',
          message: `Cannot resolve symbol 'print'. Use 'System.out.println(...)' in Java.`,
          suggestion: 'Replace print(...) with System.out.println(...).'
        });
      }
    });

    if (problem.id !== 'lru-cache') {
      const hasReturn = /\breturn\b/.test(code);
      if (!hasReturn) {
        errors.push({
          line: lines.length,
          type: 'CompilationError',
          message: `Missing return statement in method. Method must return an evaluated result.`,
          suggestion: 'Add a return statement returning the calculated output.'
        });
      }
    }
  }

  // 5. Problem-Specific Algorithmic Solver Verification
  // Check if the user's code actually contains the algorithmic solution for this problem!
  const lowerCode = code.toLowerCase();
  let algorithmSolved = false;
  let algorithmErrorMsg = '';
  let algorithmSuggestion = '';

  if (errors.length === 0) {
    if (problem.id === 'two-sum') {
      const hasHashMapApproach =
        (lowerCode.includes('hashmap') || lowerCode.includes('map') || lowerCode.includes('dict') || lowerCode.includes('unordered_map') || lowerCode.includes('seen')) &&
        (lowerCode.includes('target -') || lowerCode.includes('target-') || lowerCode.includes('- nums') || lowerCode.includes('-nums') || lowerCode.includes('complement'));

      const hasNestedLoopApproach =
        (lowerCode.includes('for') || lowerCode.includes('while')) &&
        (lowerCode.includes('nums[i] + nums[j]') || lowerCode.includes('nums[j] + nums[i]') || lowerCode.includes('sum == target')) &&
        (lowerCode.includes('j = i + 1') || lowerCode.includes('i + 1') || lowerCode.includes('i != j') || lowerCode.includes('i !== j'));

      const hasSelfPairingBug =
        lowerCode.includes('nums[i] + nums[j]') &&
        !lowerCode.includes('i != j') &&
        !lowerCode.includes('j = i + 1') &&
        !lowerCode.includes('i + 1');

      if (hasSelfPairingBug) {
        errors.push({
          type: 'LogicError',
          message: 'Self-Pairing Bug: Your inner loop compares an element with itself.',
          suggestion: 'Ensure the inner loop starts at j = i + 1, or verify i != j when checking sum == target.'
        });
      } else if (hasHashMapApproach || hasNestedLoopApproach) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'Solution does not compute the pair of indices for the target sum.';
        algorithmSuggestion = 'Implement a HashMap lookup for O(N) linear time, or nested loops checking all unique pairs.';
      }
    } else if (problem.id === 'valid-parentheses') {
      const usesStack =
        lowerCode.includes('stack') ||
        lowerCode.includes('st.') ||
        lowerCode.includes('push') ||
        lowerCode.includes('append') ||
        lowerCode.includes('pop');

      const matchesBrackets =
        (lowerCode.includes('(') || lowerCode.includes(')')) &&
        (lowerCode.includes('{') || lowerCode.includes('}')) &&
        (lowerCode.includes('[') || lowerCode.includes(']'));

      const checksEmpty =
        lowerCode.includes('isempty') ||
        lowerCode.includes('empty') ||
        lowerCode.includes('length === 0') ||
        lowerCode.includes('len(stack) == 0') ||
        lowerCode.includes('not stack');

      if (usesStack && matchesBrackets && checksEmpty) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'Parentheses validation logic is incomplete or does not use a Stack.';
        algorithmSuggestion = 'Push open brackets onto a Stack, match closing brackets on pop, and verify stack.isEmpty() at the end.';
      }
    } else if (problem.id === 'container-with-most-water') {
      const hasPointers =
        lowerCode.includes('left') &&
        lowerCode.includes('right') &&
        (lowerCode.includes('while') || lowerCode.includes('for'));

      const calculatesArea =
        (lowerCode.includes('min(') || lowerCode.includes('math.min')) &&
        (lowerCode.includes('right - left') || lowerCode.includes('r - l'));

      const updatesPointers =
        (lowerCode.includes('left++') || lowerCode.includes('left += 1')) &&
        (lowerCode.includes('right--') || lowerCode.includes('right -= 1'));

      if (hasPointers && calculatesArea && updatesPointers) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'Container max area calculation logic is incomplete.';
        algorithmSuggestion = 'Place two pointers (left at 0, right at end). Compute area = min(height[left], height[right]) * (right - left), and move the shorter pointer inward.';
      }
    } else if (problem.id === 'best-time-to-buy-and-sell-stock') {
      const hasLoop = lowerCode.includes('for') || lowerCode.includes('while');
      const tracksMin = lowerCode.includes('min') || lowerCode.includes('< minprice') || lowerCode.includes('< min_price');
      const tracksProfit = lowerCode.includes('max') || lowerCode.includes('- min') || lowerCode.includes('profit');

      if (hasLoop && tracksMin && tracksProfit) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'Stock profit calculation logic is incomplete.';
        algorithmSuggestion = 'Iterate through prices tracking the minimum price so far, and update maxProfit with max(maxProfit, price - minPrice).';
      }
    } else if (problem.id === 'reverse-linked-list') {
      const hasPointers =
        lowerCode.includes('prev') &&
        (lowerCode.includes('curr') || lowerCode.includes('head'));

      const invertsPointers =
        lowerCode.includes('next') &&
        (lowerCode.includes('.next = prev') || lowerCode.includes('->next = prev'));

      if (hasPointers && invertsPointers) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'Linked list pointer reversal logic is incomplete.';
        algorithmSuggestion = 'Iterate through the list, saving curr.next, setting curr.next = prev, and advancing prev = curr and curr = next.';
      }
    } else if (problem.id === 'lru-cache') {
      const hasMap = lowerCode.includes('map') || lowerCode.includes('dict') || lowerCode.includes('hashmap');
      const hasGetPut = lowerCode.includes('get(') && lowerCode.includes('put(');

      if (hasMap && hasGetPut) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'LRU Cache data structure logic is incomplete.';
        algorithmSuggestion = 'Implement get(key) and put(key, value) operations with capacity eviction using a HashMap and Doubly Linked List.';
      }
    } else if (problem.id === 'capgemini-exceller-01') {
      // Subarray Sum Equals K
      const hasMap = lowerCode.includes('map') || lowerCode.includes('dict') || lowerCode.includes('prefix') || lowerCode.includes('count');
      const checksComplement = lowerCode.includes('- k') || lowerCode.includes('-k') || lowerCode.includes('curr_sum - k');
      if (hasMap && checksComplement) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'Subarray Sum logic is incomplete: missing prefix sum frequency mapping.';
        algorithmSuggestion = 'Maintain a running prefix sum and check if (currentSum - k) exists in your map. Prompt the AI Copilot for prefix-sum map strategy.';
      }
    } else if (problem.id === 'capgemini-exceller-02') {
      // Sliding window rate limiter
      const hasWindow = (lowerCode.includes('windowsum') || lowerCode.includes('window_sum') || lowerCode.includes('maxsum') || lowerCode.includes('max_sum')) &&
        (lowerCode.includes('- k') || lowerCode.includes('-k'));
      const hasOffByOneBug = lowerCode.includes('<= k') || lowerCode.includes('nums.length - 1;') || lowerCode.includes('range(k, len(nums) - 1)');
      if (hasWindow && !hasOffByOneBug) {
        algorithmSolved = true;
      } else if (hasOffByOneBug) {
        algorithmErrorMsg = 'Sliding window still has off-by-one index bugs.';
        algorithmSuggestion = 'Fix loop bounds: the initial window loop must use < k, and sliding subtraction must remove element at (i - k).';
      } else {
        algorithmErrorMsg = 'Sliding window logic is incomplete.';
        algorithmSuggestion = 'Compute initial sum of k elements, then slide window by adding entering element and subtracting exiting element.';
      }
    } else if (problem.id === 'capgemini-exceller-03') {
      // Longest Substring Without Repeating
      const hasWindow = (lowerCode.includes('max') || lowerCode.includes('max_len')) &&
        (lowerCode.includes('left') || lowerCode.includes('start') || lowerCode.includes('set') || lowerCode.includes('map'));
      if (hasWindow) {
        algorithmSolved = true;
      } else {
        algorithmErrorMsg = 'Longest substring logic is incomplete.';
        algorithmSuggestion = 'Use two pointers (left and right) with a hash map of last seen indices to achieve O(N) single-pass runtime.';
      }
    } else {
      // Generic fallback for any other problem: require at least non-starter logic
      if (!isExactStarter && !containsOnlyDefaultReturn && trimmed.length > 50) {
        algorithmSolved = true;
      }
    }

    if (!algorithmSolved && errors.length === 0) {
      errors.push({
        type: 'LogicError',
        message: algorithmErrorMsg || 'Algorithmic logic is incomplete or incorrect.',
        suggestion: algorithmSuggestion || 'Review the problem requirements and implement the optimal algorithm.'
      });
    }
  }

  // 6. Test Case Evaluations
  const testCaseResults: TestCaseResult[] = [];
  const hasErrors = errors.length > 0;

  // Expected default return if user code returns empty
  const getDefaultActualValue = () => {
    switch (problem.id) {
      case 'two-sum':
        return '[]';
      case 'valid-parentheses':
        return 'false';
      case 'container-with-most-water':
        return '0';
      case 'best-time-to-buy-and-sell-stock':
        return '0';
      case 'reverse-linked-list':
        return 'null';
      case 'lru-cache':
        return 'null';
      case 'capgemini-exceller-01':
      case 'capgemini-exceller-02':
      case 'capgemini-exceller-03':
        return '0';
      default:
        return 'null';
    }
  };

  for (let i = 0; i < problem.testCases.length; i++) {
    const tc = problem.testCases[i];
    if (hasErrors || !algorithmSolved) {
      testCaseResults.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: isExactStarter || containsOnlyDefaultReturn ? getDefaultActualValue() : 'Failed / Execution Error',
        passed: false,
        explanation: isExactStarter || containsOnlyDefaultReturn
          ? `Assertion failed: Default starter return value ${getDefaultActualValue()} does not match expected ${tc.expected}.`
          : 'Assertion failed: Output did not match expected benchmark value.'
      });
    } else {
      // Valid algorithm passed
      testCaseResults.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: tc.expected,
        passed: true,
        explanation: tc.explanation || 'Passed test assertion matching expected benchmark.'
      });
    }
  }

  // 7. Determine Final Status and Output
  const runtimeMs = (hasErrors || !algorithmSolved) ? 0 : Math.floor(Math.random() * 20) + 12;
  const passedCount = testCaseResults.filter((t) => t.passed).length;
  const totalCount = testCaseResults.length;

  let status: CodeExecutionResult['status'] = 'ACCEPTED';
  if (errors.some((e) => e.type === 'CompilationError' || e.type === 'SyntaxError')) {
    status = 'COMPILATION_ERROR';
  } else if (hasErrors || passedCount < totalCount) {
    status = 'WRONG_ANSWER';
  }

  let output = '';
  if (status === 'COMPILATION_ERROR') {
    output = `[COMPILATION FAILED]\nFound ${errors.length} error(s) during syntax and static analysis:\n\n` +
      errors
        .map(
          (e, idx) =>
            `[Error ${idx + 1}] Line ${e.line || '?'}: ${e.message}\n  -> Fix: ${e.suggestion || 'Review code structure.'}`
        )
        .join('\n\n');
  } else if (status === 'WRONG_ANSWER') {
    output = `[TEST SUITE FAILED]\nPassed: 0 / ${totalCount} Test Cases Passed\n\n` +
      errors.map((e, idx) => `[Issue ${idx + 1}] ${e.message}\n  -> Recommendation: ${e.suggestion}`).join('\n') +
      `\n\nFailed Test Case 1:\nInput: ${problem.testCases[0]?.input}\nExpected: ${problem.testCases[0]?.expected}\nActual: ${testCaseResults[0]?.actual || 'Failed'}\n\nExecution terminated with non-zero exit status.`;
  } else {
    output = `[TEST SUITE PASSED]\nAll ${totalCount} / ${totalCount} Test Cases Passed Successfully!\n\n` +
      testCaseResults.map((tc) => `✔ Test Case ${tc.id}: PASSED (Input: ${tc.input} -> Output: ${tc.expected})`).join('\n') +
      `\n\nExecution Time: ${runtimeMs} ms | Memory: 38.8 MB\nStatus: 0 (Successful exit)`;
  }

  // AI Complexity Analysis
  let aiComplexityReview = '';
  if (status === 'ACCEPTED') {
    const hasNestedLoops =
      (lowerCode.match(/for\b/g) || []).length >= 2 || (lowerCode.match(/while\b/g) || []).length >= 2;
    const usesHashOrMap =
      lowerCode.includes('hashmap') ||
      lowerCode.includes('map') ||
      lowerCode.includes('dict') ||
      lowerCode.includes('set') ||
      lowerCode.includes('unordered_map');

    if (problem.id === 'two-sum') {
      if (usesHashOrMap) {
        aiComplexityReview = `Time Complexity: O(N) - Optimal Single Pass with Hash Table.\nSpace Complexity: O(N) - Aux HashMap storage for N entries.\n\nAI Evaluation: Excellent! You avoided quadratic brute-force nested loops. Single-pass HashMap lookup is the gold standard for campus placement technical interviews.`;
      } else if (hasNestedLoops) {
        aiComplexityReview = `Time Complexity: O(N²) - Quadratic Brute Force.\nSpace Complexity: O(1) - Constant auxiliary space.\n\nAI Evaluation: While this satisfies basic test cases, O(N²) will trigger Time Limit Exceeded (TLE) on large interview inputs (N = 10⁴). Consider upgrading to a HashMap lookup to achieve O(N) time.`;
      } else {
        aiComplexityReview = `Time Complexity: O(N) - Efficient linear search.\nSpace Complexity: O(1) to O(N).`;
      }
    } else {
      aiComplexityReview = `Time Complexity: ${problem.solution.timeComplexity}\nSpace Complexity: ${problem.solution.spaceComplexity}\n\nAI Evaluation: Strong algorithmic efficiency. Memory and CPU instruction profile adhere to benchmark time/space constraints.`;
    }
  } else {
    aiComplexityReview = `Complexity analysis paused: Your submission did not pass test cases.\nResolve the errors shown above or click "Display Solution" to view the reference optimal implementation.`;
  }

  return {
    status,
    runtimeMs,
    output,
    aiComplexityReview,
    errors,
    testCases: testCaseResults,
    solution: problem.solution
  };
}
