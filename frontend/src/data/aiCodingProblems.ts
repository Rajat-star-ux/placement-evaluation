import type { ProblemExample, ProblemSolution } from '../types';

export interface AiCodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
  category: 'algorithm' | 'debugging' | 'optimization';
  tokenBudget: number; // e.g. 2000
  description: string;
  constraints: string[];
  examples: ProblemExample[];
  starterCode: Record<string, string>;
  // For debugging challenges: initial buggy code
  buggyCode?: Record<string, string>;
  knownBugs?: string[];
  solution: ProblemSolution;
  testCases: Array<{
    id: number;
    input: string;
    expected: string;
    explanation?: string;
  }>;
}

export interface AiMcq {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'Prompt Engineering' | 'LLM Mechanics' | 'Code Verification' | 'AI Ethics & Hallucination';
}

export const AI_CODING_PROBLEMS: AiCodingProblem[] = [
  {
    id: 'capgemini-exceller-01',
    title: 'Order Tracking System (Subarray Sum Equals K)',
    difficulty: 'Medium',
    companyTags: ['Capgemini Exceller', 'Amazon', 'Cognizant GenC Next'],
    category: 'algorithm',
    tokenBudget: 2000,
    description: `Capgemini Online Assessment - AI-Assisted Section:
A logistics dashboard receives batches of package tracking weights throughout the day as an array of integers. 
You are tasked with finding the total count of continuous subarrays whose sum equals a given target \`k\`.

Your challenge is to leverage the AI Copilot effectively within your **2,000 Token Budget**. 
Evaluation criteria:
1. Specificity of prompts (mentioning constraints, time/space limits, edge cases like negative values).
2. Code review diligence: Review AI generated proposals, check for negative value handling ($O(N)$ prefix sums with HashMap vs brute force $O(N^2)$), and run test cases.`,
    constraints: [
      '1 <= nums.length <= 2 * 10^4',
      '-1000 <= nums[i] <= 1000 (Notice: Elements can be negative!)',
      '-10^7 <= k <= 10^7',
      'Target Time Complexity: O(N)',
      'Target Space Complexity: O(N)'
    ],
    examples: [
      {
        input: 'nums = [1, 1, 1], k = 2',
        output: '2',
        explanation: 'Subarrays [1, 1] at index 0..1 and index 1..2 both sum to 2.'
      },
      {
        input: 'nums = [1, 2, 3], k = 3',
        output: '2',
        explanation: 'Subarrays [1, 2] and [3] sum to 3.'
      },
      {
        input: 'nums = [1, -1, 0], k = 0',
        output: '3',
        explanation: 'Subarrays [1, -1], [0], and [1, -1, 0] all sum to 0.'
      }
    ],
    starterCode: {
      java: `class Solution {
    public int subarraySum(int[] nums, int k) {
        // Use the AI Copilot to generate or refine your solution
        // Remember to optimize for O(N) using HashMap
        return 0;
    }
}`,
      python: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        # Prompt the AI Assistant for an optimal O(N) prefix-sum hash map approach
        return 0`,
      cpp: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        // Use AI Copilot to implement prefix-sum frequency map
        return 0;
    }
};`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var subarraySum = function(nums, k) {
    // Prompt AI Assistant to generate optimal O(N) approach
    return 0;
};`
    },
    solution: {
      approach: 'Prefix Sum frequency map (HashMap) keeping track of cumulative sum occurrences.',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      explanation: 'Maintain a running prefix sum `currSum`. If `currSum - k` exists in the map, add its frequency to our result. Then insert/increment `currSum` in the map. Crucial edge case: initialize map with {0: 1} to handle subarrays starting at index 0.',
      code: {
        java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0;
        int currentSum = 0;
        Map<Integer, Integer> prefixSumMap = new HashMap<>();
        prefixSumMap.put(0, 1);

        for (int num : nums) {
            currentSum += num;
            if (prefixSumMap.containsKey(currentSum - k)) {
                count += prefixSumMap.get(currentSum - k);
            }
            prefixSumMap.put(currentSum, prefixSumMap.getOrDefault(currentSum, 0) + 1);
        }

        return count;
    }
}`,
        python: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        count = 0
        curr_sum = 0
        prefix_sums = {0: 1}
        
        for num in nums:
            curr_sum += num
            if (curr_sum - k) in prefix_sums:
                count += prefix_sums[curr_sum - k]
            prefix_sums[curr_sum] = prefix_sums.get(curr_sum, 0) + 1
            
        return count`,
        cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int count = 0;
        int currSum = 0;
        unordered_map<int, int> prefixSum;
        prefixSum[0] = 1;

        for (int num : nums) {
            currSum += num;
            if (prefixSum.find(currSum - k) != prefixSum.end()) {
                count += prefixSum[currSum - k];
            }
            prefixSum[currSum]++;
        }

        return count;
    }
};`,
        javascript: `var subarraySum = function(nums, k) {
    let count = 0;
    let currSum = 0;
    const map = new Map();
    map.set(0, 1);

    for (let num of nums) {
        currSum += num;
        if (map.has(currSum - k)) {
            count += map.get(currSum - k);
        }
        map.set(currSum, (map.get(currSum) || 0) + 1);
    }

    return count;
};`
      },
      keyTakeaways: [
        'Prefix sum difference: (prefix[j] - prefix[i]) == k implies subarray i..j sums to k.',
        'Negative numbers mean the prefix sum is NOT strictly monotonic; sliding window does not work here.',
        'Always seed map with {0: 1} to count subarrays matching k directly from index 0.'
      ]
    },
    testCases: [
      { id: 1, input: 'nums = [1, 1, 1], k = 2', expected: '2', explanation: '[1,1] at [0,1] and [1,2]' },
      { id: 2, input: 'nums = [1, 2, 3], k = 3', expected: '2', explanation: '[1,2] and [3]' },
      { id: 3, input: 'nums = [1, -1, 0], k = 0', expected: '3', explanation: 'Handles negative and zero sums' },
      { id: 4, input: 'nums = [3, 4, 7, 2, -3, 1, 4, 2], k = 7', expected: '4', explanation: 'Longer sequence with mixed operations' }
    ]
  },
  {
    id: 'capgemini-exceller-02',
    title: 'AI Debugging Round: Defective Rate Limiter Window',
    difficulty: 'Medium',
    companyTags: ['Capgemini Exceller', 'Wipro Turbo', 'TCS Digital'],
    category: 'debugging',
    tokenBudget: 2000,
    description: `Capgemini OA Debugging Section:
A candidate before you submitted this Sliding Window Rate Limiter implementation to count maximum requests in an uninterrupted window of size \`k\`, but it fails on multiple edge cases.

Bugs present in candidate code:
1. Off-by-one loop indexing causing ArrayIndexOutOfBounds / missing the final element.
2. Window slide step fails to subtract the leaving element properly.
3. Fails on array length smaller than k.

Use the AI Assistant to diagnose the bug, prompt for the correct sliding window logic, inspect the suggested fix, and verify with all test cases.`,
    constraints: [
      '1 <= k <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: 'nums = [1, 4, 2, 10, 23, 3, 1, 0, 20], k = 4',
        output: '39',
        explanation: 'Subarray [4, 2, 10, 23] has max sum = 39.'
      },
      {
        input: 'nums = [100, 200, 300, 400], k = 2',
        output: '700',
        explanation: 'Subarray [300, 400] has max sum = 700.'
      }
    ],
    starterCode: {
      java: `class Solution {
    // BUGGY CODE: Diagnose and fix using AI Copilot
    public int maxSubarraySum(int[] nums, int k) {
        if (nums.length < k) return -1;
        int maxSum = 0;
        int windowSum = 0;
        
        // BUG 1: loop goes up to k instead of < k
        for (int i = 0; i <= k; i++) {
            windowSum += nums[i];
        }
        maxSum = windowSum;
        
        // BUG 2: loop condition misses boundary & subtracts wrong index
        for (int i = k; i < nums.length - 1; i++) {
            windowSum += nums[i] - nums[i - k + 1];
            if (windowSum > maxSum) {
                maxSum = windowSum;
            }
        }
        return maxSum;
    }
}`,
      python: `class Solution:
    # BUGGY CODE: Diagnose and fix using AI Copilot
    def maxSubarraySum(self, nums: list[int], k: int) -> int:
        if len(nums) < k:
            return -1
        # BUG: Initial window includes k+1 elements
        window_sum = sum(nums[:k+1])
        max_sum = window_sum
        
        # BUG: Off-by-one window slide
        for i in range(k, len(nums) - 1):
            window_sum += nums[i] - nums[i - k + 1]
            if window_sum > max_sum:
                max_sum = window_sum
        return max_sum`,
      cpp: `class Solution {
public:
    int maxSubarraySum(vector<int>& nums, int k) {
        if (nums.size() < k) return -1;
        int windowSum = 0;
        for (int i = 0; i <= k; i++) {
            windowSum += nums[i];
        }
        int maxSum = windowSum;
        for (int i = k; i < nums.size() - 1; i++) {
            windowSum += nums[i] - nums[i - k + 1];
            maxSum = max(maxSum, windowSum);
        }
        return maxSum;
    }
};`,
      javascript: `var maxSubarraySum = function(nums, k) {
    if (nums.length < k) return -1;
    let windowSum = 0;
    for (let i = 0; i <= k; i++) {
        windowSum += nums[i];
    }
    let maxSum = windowSum;
    for (let i = k; i < nums.length - 1; i++) {
        windowSum += nums[i] - nums[i - k + 1];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
};`
    },
    knownBugs: [
      'Initial window loop iterates up to <= k instead of < k (taking k+1 elements)',
      'Sliding loop iterates up to nums.length - 1 instead of < nums.length (misses the last element)',
      'Subtracted index is i - k + 1 instead of i - k (wrong element removed from sliding window)'
    ],
    solution: {
      approach: 'Classic Fixed-Size Sliding Window (O(N) time, O(1) extra space).',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      explanation: 'First compute sum of the first k elements `nums[0..k-1]`. Then slide from `i = k` to `nums.length - 1`, adding `nums[i]` and subtracting `nums[i - k]`. Update `maxSum` at each step.',
      code: {
        java: `class Solution {
    public int maxSubarraySum(int[] nums, int k) {
        if (nums == null || nums.length < k) return -1;
        
        int windowSum = 0;
        for (int i = 0; i < k; i++) {
            windowSum += nums[i];
        }
        
        int maxSum = windowSum;
        for (int i = k; i < nums.length; i++) {
            windowSum += nums[i] - nums[i - k];
            if (windowSum > maxSum) {
                maxSum = windowSum;
            }
        }
        
        return maxSum;
    }
}`,
        python: `class Solution:
    def maxSubarraySum(self, nums: list[int], k: int) -> int:
        if not nums or len(nums) < k:
            return -1
            
        window_sum = sum(nums[:k])
        max_sum = window_sum
        
        for i in range(k, len(nums)):
            window_sum += nums[i] - nums[i - k]
            if window_sum > max_sum:
                max_sum = window_sum
                
        return max_sum`,
        cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubarraySum(vector<int>& nums, int k) {
        if (nums.size() < k) return -1;
        
        int windowSum = 0;
        for (int i = 0; i < k; i++) {
            windowSum += nums[i];
        }
        
        int maxSum = windowSum;
        for (int i = k; i < nums.size(); i++) {
            windowSum += nums[i] - nums[i - k];
            maxSum = max(maxSum, windowSum);
        }
        
        return maxSum;
    }
};`,
        javascript: `var maxSubarraySum = function(nums, k) {
    if (!nums || nums.length < k) return -1;
    
    let windowSum = 0;
    for (let i = 0; i < k; i++) {
        windowSum += nums[i];
    }
    
    let maxSum = windowSum;
    for (let i = k; i < nums.length; i++) {
        windowSum += nums[i] - nums[i - k];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
};`
      },
      keyTakeaways: [
        'Always check array boundary conditions: index < k for the first window.',
        'Sliding subtraction formula: exiting element is at (i - k), entering element is at i.',
        'Remember edge cases where array length < k.'
      ]
    },
    testCases: [
      { id: 1, input: 'nums = [1, 4, 2, 10, 23, 3, 1, 0, 20], k = 4', expected: '39', explanation: 'Window [4, 2, 10, 23] = 39' },
      { id: 2, input: 'nums = [100, 200, 300, 400], k = 2', expected: '700', explanation: 'Window [300, 400] = 700' },
      { id: 3, input: 'nums = [2, 3], k = 3', expected: '-1', explanation: 'Array length smaller than k' },
      { id: 4, input: 'nums = [-1, -2, -3, -4], k = 2', expected: '-3', explanation: 'All negative values: [-1, -2] = -3' }
    ]
  },
  {
    id: 'capgemini-exceller-03',
    title: 'Code Optimization: Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    companyTags: ['Capgemini Exceller', 'Accenture', 'Microsoft'],
    category: 'optimization',
    tokenBudget: 2000,
    description: `Capgemini OA Optimization Round:
Given a string \`s\`, find the length of the longest substring without repeating characters.

A novice implementation is provided that uses an $O(N^3)$ nested loop with string slicing and checking for duplicates. 
Your objective:
1. Prompt the AI Copilot to transform this brute force $O(N^3)$ solution into an optimal $O(N)$ two-pointer / sliding window algorithm using a hash set or character index array.
2. In your prompt, specify space and time constraints ($O(N)$ and $O(\min(N, M))$).
3. Verify handling of empty string \`""\` and all identical characters \`"bbbbb"\`.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with length of 3.'
      }
    ],
    starterCode: {
      java: `class Solution {
    // Current O(N^3) solution - Prompt AI Copilot to optimize to O(N)
    public int lengthOfLongestSubstring(String s) {
        int n = s.length();
        int res = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                boolean[] seen = new boolean[128];
                boolean hasDup = false;
                for (int k = i; k <= j; k++) {
                    if (seen[s.charAt(k)]) {
                        hasDup = true;
                        break;
                    }
                    seen[s.charAt(k)] = true;
                }
                if (!hasDup) {
                    res = Math.max(res, j - i + 1);
                }
            }
        }
        return res;
    }
}`,
      python: `class Solution:
    # Current brute force O(N^3) - Prompt AI to optimize to O(N) sliding window
    def lengthOfLongestSubstring(self, s: str) -> int:
        n = len(s)
        res = 0
        for i in range(n):
            for j in range(i, n):
                sub = s[i:j+1]
                if len(sub) == len(set(sub)):
                    res = max(res, len(sub))
        return res`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.length();
        int res = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                string sub = s.substr(i, j - i + 1);
                unordered_set<char> chars(sub.begin(), sub.end());
                if (chars.size() == sub.length()) {
                    res = max(res, (int)sub.length());
                }
            }
        }
        return res;
    }
};`,
      javascript: `var lengthOfLongestSubstring = function(s) {
    let res = 0;
    for (let i = 0; i < s.length; i++) {
        for (let j = i; j < s.length; j++) {
            let sub = s.slice(i, j + 1);
            if (new Set(sub).size === sub.length) {
                res = Math.max(res, sub.length);
            }
        }
    }
    return res;
};`
    },
    solution: {
      approach: 'Sliding Window using Character Last-Seen Index Map (O(N) time, O(min(N, alphabet_size)) space).',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(min(M, N)) where M is character charset size',
      explanation: 'Maintain two pointers `left` and `right`. As `right` scans through `s`, check if `s[right]` was seen previously at index `>= left`. If so, jump `left` to `last_index + 1`. Update the max length as `right - left + 1`.',
      code: {
        java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        if (s == null || s.length() == 0) return 0;
        
        Map<Character, Integer> lastSeen = new HashMap<>();
        int maxLength = 0;
        int left = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
                left = lastSeen.get(c) + 1;
            }
            lastSeen.put(c, right);
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }
}`,
        python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last_seen = {}
        left = 0
        max_len = 0
        
        for right, char in enumerate(s):
            if char in last_seen and last_seen[char] >= left:
                left = last_seen[char] + 1
            last_seen[char] = right
            max_len = max(max_len, right - left + 1)
            
        return max_len`,
        cpp: `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> lastSeen;
        int left = 0;
        int maxLength = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s[right];
            if (lastSeen.find(c) != lastSeen.end() && lastSeen[c] >= left) {
                left = lastSeen[c] + 1;
            }
            lastSeen[c] = right;
            maxLength = max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }
};`,
        javascript: `var lengthOfLongestSubstring = function(s) {
    const lastSeen = new Map();
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        if (lastSeen.has(char) && lastSeen.get(char) >= left) {
            left = lastSeen.get(char) + 1;
        }
        lastSeen.set(char, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
};`
      },
      keyTakeaways: [
        'Sliding window with map allows O(N) single-pass without rescanning characters.',
        'Condition `lastSeen.get(c) >= left` ensures you do not jump left backwards to characters outside the current window.',
        'Empty string `""` immediately yields 0.'
      ]
    },
    testCases: [
      { id: 1, input: 's = "abcabcbb"', expected: '3', explanation: 'Substrings: "abc"' },
      { id: 2, input: 's = "bbbbb"', expected: '1', explanation: 'All repeated: "b"' },
      { id: 3, input: 's = "pwwkew"', expected: '3', explanation: 'Answer is "wke"' },
      { id: 4, input: 's = ""', expected: '0', explanation: 'Empty string base case' }
    ]
  }
];

export const AI_LITERACY_MCQS: AiMcq[] = [
  {
    id: 1,
    question: 'In Capgemini and modern tech assessments, what is the primary risk of directly copying code generated by an AI Copilot without manual review?',
    options: [
      'The code might be written in an obsolete programming language',
      'The AI might hallucinate non-existent libraries or miss subtle edge cases (e.g. integer overflow, off-by-one, empty input)',
      'The code will always execute in O(N!) time complexity',
      'AI code is rejected automatically by the compiler'
    ],
    correctIndex: 1,
    explanation: 'LLMs can generate syntactically convincing code that hallucinates internal methods or overlooks edge cases such as empty arrays, null inputs, or scale limits. Human verification is a core OA evaluation parameter.',
    category: 'Code Verification'
  },
  {
    id: 2,
    question: 'Which of the following prompt patterns produces the highest-quality algorithmic code from an AI assistant while conserving token budget?',
    options: [
      '"Write code to solve the problem as fast as you can."',
      '"Fix the error in my code."',
      '"Given an array of integers with negative values allowed, write an O(N) time and O(N) space solution in Java using a prefix-sum HashMap. Include boundary checks."',
      '"Can you give me 5 different approaches to solve this and explain their histories?"'
    ],
    correctIndex: 2,
    explanation: 'Effective prompt engineering in assessments involves specifying input constraints (e.g., negative values), explicit time/space complexity ($O(N)$), data structures to use (HashMap), and target language in a concise single prompt.',
    category: 'Prompt Engineering'
  },
  {
    id: 3,
    question: 'What does "Zero-Shot" vs "Few-Shot" prompting mean when interacting with an AI code assistant during an OA?',
    options: [
      'Zero-Shot means asking without examples; Few-Shot provides input/output examples to guide the model',
      'Zero-Shot means no token consumption; Few-Shot uses all 2000 tokens',
      'Zero-Shot compiles once; Few-Shot compiles multiple times',
      'Zero-Shot only works for Python; Few-Shot works for Java'
    ],
    correctIndex: 0,
    explanation: 'Zero-shot prompting asks the model to perform a task with only instructions. Few-shot provides 1-3 input/output examples, which significantly reduces edge-case failures in algorithmic code generation.',
    category: 'LLM Mechanics'
  },
  {
    id: 4,
    question: 'During an AI-assisted OA, your 2,000 token budget is 85% depleted. Which prompt strategy should you adopt next?',
    options: [
      'Paste the entire problem statement and all code again into the chat',
      'Ask the AI to generate unit tests, documentation, and alternate approaches',
      'Write targeted, concise prompts asking specifically for the flawed function or bug fix (e.g., "Fix off-by-one error at line 14")',
      'Keep sending "Please help" repeatedly'
    ],
    correctIndex: 2,
    explanation: 'Token budgeting is evaluated in corporate OAs. When low on tokens, candidates should provide targeted, delta-focused prompts rather than re-sending full problem descriptions.',
    category: 'Prompt Engineering'
  },
  {
    id: 5,
    question: 'What is a "hallucination" in the context of an AI coding copilot?',
    options: [
      'The code runs 10x faster than expected',
      'The model confidently invokes methods or packages that do not exist or invents untrue problem constraints',
      'The IDE terminal screen flickers',
      'The token budget counter resets to 2000'
    ],
    correctIndex: 1,
    explanation: 'Hallucination occurs when an LLM produces plausible-sounding but completely fictitious or incorrect code, APIs, or logic. Verifying generated APIs against official documentation is essential.',
    category: 'AI Ethics & Hallucination'
  }
];

