import type { CodingProblem } from '../types';

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum & HashMap Optimization',
    difficulty: 'Easy',
    domain: 'Arrays & Hash Table',
    companyTags: ['Google', 'Amazon', 'Meta', 'Bloomberg', 'Microsoft'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Problem Requirements:
- Find two distinct indices \`i\` and \`j\` where \`nums[i] + nums[j] == target\` and \`i != j\`.
- Optimize beyond the naive brute-force $O(N^2)$ algorithm to achieve $O(N)$ linear time.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
        return new int[]{};
    }
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
        return {};
    }
};`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    
    return [];
}`
    },
    solution: {
      approach: 'One-Pass Hash Table (Complement Lookup)',
      timeComplexity: 'O(N) - Linear time, single pass through array',
      spaceComplexity: 'O(N) - Hash map storing up to N elements',
      explanation: `1. **Intuition**: Instead of iterating through all pairs with nested loops ($O(N^2)$), we can remember each number we've seen so far in a Hash Table (map).
2. **Complement Check**: For each element \`nums[i]\`, the required partner is \`complement = target - nums[i]\`.
3. **Constant-Time Lookup**: Check if \`complement\` is already stored in the hash map.
   - If found: return \`[map[complement], i]\`.
   - If not found: insert \`nums[i] -> i\` into the map and continue.
4. **Edge Cases**: Handles negative integers, identical values (e.g. \`[3, 3]\` target 6), and large arrays without timeouts.`,
      keyTakeaways: [
        'Always check if space-time trade-off via HashMap can turn O(N^2) search into O(N).',
        'Inserting after checking prevents reusing the same element twice (e.g. nums[i] matching itself).',
        'HashMap lookup operates in average O(1) time complexity.'
      ],
      code: {
        java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Map to store value -> index
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            // Check if complement has already been seen
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            
            // Store current number and its index
            map.put(nums[i], i);
        }
        
        return new int[]{}; // No solution found
    }
}`,
        python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Map to store value -> index
        seen = {}
        
        for i, num in enumerate(nums):
            complement = target - num
            
            # Check if complement has already been seen
            if complement in seen:
                return [seen[complement], i]
            
            # Record current number and index
            seen[num] = i
            
        return []`,
        cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            if (numMap.find(complement) != numMap.end()) {
                return { numMap[complement], i };
            }
            
            numMap[nums[i]] = i;
        }
        
        return {};
    }
};`,
        javascript: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`
      }
    },
    testCases: [
      { id: 1, input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]', explanation: 'First pair 2 + 7 = 9' },
      { id: 2, input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]', explanation: 'Elements 2 and 4 at indices 1 and 2' },
      { id: 3, input: 'nums = [3, 3], target = 6', expected: '[0, 1]', explanation: 'Identical numbers at indices 0 and 1' },
      { id: 4, input: 'nums = [-1, -2, -3, -4, -5], target = -8', expected: '[2, 4]', explanation: '-3 + (-5) = -8' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses & Stack Order',
    difficulty: 'Easy',
    domain: 'Stack & String Parsing',
    companyTags: ['Microsoft', 'Meta', 'Amazon', 'Bloomberg', 'Apple'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Placement Importance:
This is one of the most frequently asked foundational stack questions across Amazon, Microsoft, and Infosys campus interviews.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'Simple matched parentheses pair.'
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All open brackets matched immediately in order.'
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Mismatched bracket types: "(" closed by "]".'
      },
      {
        input: 's = "([)]"',
        output: 'false',
        explanation: 'Improper nesting: "[" must close before "(" closes.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: "()[]{}"'
    ],
    starterCode: {
      java: `import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        
        return false;
    }
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        pass`,
      cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        
        return false;
    }
};`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your solution here
    
    return false;
}`
    },
    solution: {
      approach: 'LIFO Stack with Matching Bracket Map',
      timeComplexity: 'O(N) - Linear pass through the string of length N',
      spaceComplexity: 'O(N) - Stack stores open brackets (up to N/2 elements)',
      explanation: `1. **LIFO Principle**: The most recently opened bracket must be the first one to close. A Stack perfectly mirrors this requirement.
2. **Algorithm**:
   - Push open brackets (\`(\`, \`[\`, \`{\`) onto the stack.
   - When encountering a closing bracket, check if the stack is non-empty and whether the top matches the corresponding open bracket.
   - If it doesn't match or the stack is empty, return \`false\`.
   - At the end, return \`true\` only if the stack is completely empty (no lingering open brackets).`,
      keyTakeaways: [
        'Always check stack.isEmpty() before attempting to peek or pop to prevent EmptyStackException.',
        'At the end of iteration, verify stack.isEmpty() to catch unclosed open brackets like "((".',
        'Map or switch statement keeps bracket pair lookup O(1).'
      ],
      code: {
        java: `import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        if (s.length() % 2 != 0) return false;
        
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') {
                stack.push(')');
            } else if (c == '{') {
                stack.push('}');
            } else if (c == '[') {
                stack.push(']');
            } else {
                // If closing bracket encounters empty stack or mismatch
                if (stack.isEmpty() || stack.pop() != c) {
                    return false;
                }
            }
        }
        
        return stack.isEmpty();
    }
}`,
        python: `class Solution:
    def isValid(self, s: str) -> bool:
        if len(s) % 2 != 0:
            return False
            
        mapping = {')': '(', '}': '{', ']': '['}
        stack = []
        
        for char in s:
            if char in mapping:
                top_element = stack.pop() if stack else '#'
                if mapping[char] != top_element:
                    return False
            else:
                stack.append(char)
                
        return len(stack) == 0`,
        cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        if (s.length() % 2 != 0) return false;
        
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else {
                if (st.empty() || st.top() != c) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
        javascript: `function isValid(s) {
    if (s.length % 2 !== 0) return false;
    
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack.pop() !== map[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}`
      }
    },
    testCases: [
      { id: 1, input: 's = "()"', expected: 'true', explanation: 'Basic valid pair' },
      { id: 2, input: 's = "()[]{}"', expected: 'true', explanation: 'Multiple sequential pairs' },
      { id: 3, input: 's = "(]"', expected: 'false', explanation: 'Mismatched types' },
      { id: 4, input: 's = "([)]"', expected: 'false', explanation: 'Improper nesting order' },
      { id: 5, input: 's = "{[]}"', expected: 'true', explanation: 'Proper nested brackets' }
    ]
  },
  {
    id: 'container-with-most-water',
    title: 'Container With Most Water - Two Pointers',
    difficulty: 'Medium',
    domain: 'Two Pointers & Greedy',
    companyTags: ['Google', 'Amazon', 'Adobe', 'Uber', 'Goldman Sachs'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the $i^{th}$ line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the **maximum amount of water** a container can store.

Notice that you may not slant the container.

### Formulation:
For any two lines at indices \`left\` and \`right\`:
$$\\text{Area} = \\min(\\text{height}[\\text{left}], \\text{height}[\\text{right}]) \\times (\\text{right} - \\text{left})$$`,
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'Max area is between index 1 (height 8) and index 8 (height 7): min(8, 7) * (8 - 1) = 7 * 7 = 49.'
      },
      {
        input: 'height = [1,1]',
        output: '1',
        explanation: 'min(1, 1) * (1 - 0) = 1.'
      }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    starterCode: {
      java: `public class Solution {
    public int maxArea(int[] height) {
        // Write your solution here
        
        return 0;
    }
}`,
      python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Write your solution here
        pass`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your solution here
        
        return 0;
    }
};`,
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
    // Write your solution here
    
    return 0;
}`
    },
    solution: {
      approach: 'Two-Pointer Greedy Inward Convergence',
      timeComplexity: 'O(N) - Left and right pointers meet after N-1 steps',
      spaceComplexity: 'O(1) - Constant auxiliary space',
      explanation: `1. **Initial State**: Place pointer \`left = 0\` and \`right = height.length - 1\` to maximize the width.
2. **Greedy Decision**: The area is bottlenecked by the shorter vertical line. Moving the taller line inward can only decrease width without any chance of increasing the minimum height.
3. **Inward Step**: Always advance the pointer pointing to the shorter line towards the center.
4. **Optimal Invariant**: At every step, we discard only combinations that are guaranteed to have a smaller area than the current maximum.`,
      keyTakeaways: [
        'Two-pointer greedy approach reduces O(N^2) exhaustive search to clean O(N).',
        'Always move the pointer with the smaller height to explore higher potential bottlenecks.',
        'Runs in O(1) space with zero memory allocations.'
      ],
      code: {
        java: `public class Solution {
    public int maxArea(int[] height) {
        int left = 0;
        int right = height.length - 1;
        int maxArea = 0;
        
        while (left < right) {
            int width = right - left;
            int h = Math.min(height[left], height[right]);
            int area = width * h;
            
            if (area > maxArea) {
                maxArea = area;
            }
            
            // Advance the shorter vertical line pointer
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        
        return maxArea;
    }
}`,
        python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        max_water = 0
        
        while left < right:
            width = right - left
            h = min(height[left], height[right])
            max_water = max(max_water, width * h)
            
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
                
        return max_water`,
        cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int maxWater = 0;
        
        while (left < right) {
            int currentArea = min(height[left], height[right]) * (right - left);
            maxWater = max(maxWater, currentArea);
            
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        
        return maxWater;
    }
};`,
        javascript: `function maxArea(height) {
    let left = 0;
    let right = height.length - 1;
    let maxWater = 0;
    
    while (left < right) {
        const area = Math.min(height[left], height[right]) * (right - left);
        if (area > maxWater) maxWater = area;
        
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxWater;
}`
      }
    },
    testCases: [
      { id: 1, input: 'height = [1,8,6,2,5,4,8,3,7]', expected: '49', explanation: 'Max area between index 1 and 8' },
      { id: 2, input: 'height = [1,1]', expected: '1', explanation: 'Simple two pillar container' },
      { id: 3, input: 'height = [4,3,2,1,4]', expected: '16', explanation: 'Outer pillars 4 and 4 with width 4' },
      { id: 4, input: 'height = [1,2,1]', expected: '2', explanation: 'Width 2 with min height 1' }
    ]
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    domain: 'Dynamic Programming & Kadane',
    companyTags: ['Amazon', 'Apple', 'Goldman Sachs', 'TCS', 'Infosys'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the $i^{th}$ day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5. Note buying day 2 and selling day 1 is not allowed.'
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    starterCode: {
      java: `public class Solution {
    public int maxProfit(int[] prices) {
        // Write your solution here
        
        return 0;
    }
}`,
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        # Write your solution here
        pass`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your solution here
        
        return 0;
    }
};`,
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    // Write your solution here
    
    return 0;
}`
    },
    solution: {
      approach: 'Single-Pass Min-Tracking (Kadane Variant)',
      timeComplexity: 'O(N) - Linear single pass through the prices array',
      spaceComplexity: 'O(1) - Constant auxiliary variables for minPrice and maxProfit',
      explanation: `1. **Core Insight**: To maximize profit, for every candidate selling day $i$, we should have bought at the minimum price seen *prior* to day $i$.
2. **Variables**: Track \`minPrice\` initialized to infinity (or prices[0]) and \`maxProfit\` initialized to 0.
3. **Iteration**:
   - If \`prices[i] < minPrice\`, update \`minPrice = prices[i]\`.
   - Else if \`prices[i] - minPrice > maxProfit\`, update \`maxProfit = prices[i] - minPrice\`.
4. **Complexity**: Complete in a single pass of $O(N)$ with $O(1)$ memory.`,
      keyTakeaways: [
        'Avoid nested O(N^2) loops comparing all buy-sell combinations.',
        'Keep track of the minimum price so far on the fly.',
        'Condition ensures you cannot sell in the past before buying.'
      ],
      code: {
        java: `public class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        
        return maxProfit;
    }
}`,
        python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        
        for price in prices:
            if price < min_price:
                min_price = price
            elif price - min_price > max_profit:
                max_profit = price - min_price
                
        return max_profit`,
        cpp: `#include <vector>
#include <climits>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX;
        int maxProfit = 0;
        
        for (int price : prices) {
            minPrice = min(minPrice, price);
            maxProfit = max(maxProfit, price - minPrice);
        }
        
        return maxProfit;
    }
};`,
        javascript: `function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProfit = 0;
    
    for (const price of prices) {
        if (price < minPrice) {
            minPrice = price;
        } else if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice;
        }
    }
    
    return maxProfit;
}`
      }
    },
    testCases: [
      { id: 1, input: 'prices = [7, 1, 5, 3, 6, 4]', expected: '5', explanation: 'Buy day 2 (1), sell day 5 (6)' },
      { id: 2, input: 'prices = [7, 6, 4, 3, 1]', expected: '0', explanation: 'Continually falling prices yield 0 profit' },
      { id: 3, input: 'prices = [2, 4, 1]', expected: '2', explanation: 'Buy at 2, sell at 4' }
    ]
  },
  {
    id: 'reverse-linked-list',
    title: 'In-Place Reversal of Singly Linked List',
    difficulty: 'Easy',
    domain: 'Linked List & Pointers',
    companyTags: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'Wipro'],
    description: `Given the \`head\` of a singly linked list, reverse the list in-place, and return the reversed list's new head.

### Placement Note:
Pointers manipulation in linked lists is a staple benchmark test in technical screening interviews to assess pointer safety and edge case handling (empty list, single node).`,
    examples: [
      {
        input: 'head = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
        explanation: 'All pointer arrows inverted in-place.'
      },
      {
        input: 'head = [1, 2]',
        output: '[2, 1]',
        explanation: 'Two-node list reversed.'
      },
      {
        input: 'head = []',
        output: '[]',
        explanation: 'Empty list returns null/empty.'
      }
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    starterCode: {
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int val) { this.val = val; }
 * }
 */
public class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        
        return null;
    }
}`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head):
        # Write your solution here
        pass`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(nullptr) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        
        return nullptr;
    }
};`,
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
function reverseList(head) {
    // Write your solution here
    
    return null;
}`
    },
    solution: {
      approach: 'Iterative 3-Pointer Reversal (prev, curr, next)',
      timeComplexity: 'O(N) - Single pass visiting each node exactly once',
      spaceComplexity: 'O(1) - In-place pointer mutation without extra memory',
      explanation: `1. **Three Pointers**: Maintain \`prev = null\` and \`curr = head\`.
2. **Iteration Loop**:
   - Save \`nextTemp = curr.next\` before mutating the pointer.
   - Reverse the current link: \`curr.next = prev\`.
   - Advance \`prev = curr\`.
   - Advance \`curr = nextTemp\`.
3. **Completion**: When \`curr == null\`, \`prev\` points to the new head of the reversed list.`,
      keyTakeaways: [
        'Always store the next pointer before modifying curr.next, or the rest of the list is permanently lost.',
        'Prev initializes to null, which correctly becomes the tail.next of the reversed list.',
        'Runs with O(1) space complexity.'
      ],
      code: {
        java: `public class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        
        while (curr != null) {
            ListNode nextTemp = curr.next; // Save next node
            curr.next = prev;             // Reverse pointer
            prev = curr;                  // Advance prev
            curr = nextTemp;              // Advance curr
        }
        
        return prev; // New head of reversed list
    }
}`,
        python: `class Solution:
    def reverseList(self, head):
        prev = None
        curr = head
        
        while curr:
            next_node = curr.next # Save next
            curr.next = prev      # Reverse pointer
            prev = curr           # Move prev forward
            curr = next_node      # Move curr forward
            
        return prev`,
        cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        
        while (curr != nullptr) {
            ListNode* nextTemp = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nextTemp;
        }
        
        return prev;
    }
};`,
        javascript: `function reverseList(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        const nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    
    return prev;
}`
      }
    },
    testCases: [
      { id: 1, input: 'head = [1, 2, 3, 4, 5]', expected: '[5, 4, 3, 2, 1]', explanation: 'Standard 5-node list reversal' },
      { id: 2, input: 'head = [1, 2]', expected: '[2, 1]', explanation: 'Two-node list reversal' },
      { id: 3, input: 'head = []', expected: '[]', explanation: 'Empty list edge case' }
    ]
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache Implementation',
    difficulty: 'Hard',
    domain: 'System Design & Doubly Linked List',
    companyTags: ['Google', 'Amazon', 'Microsoft', 'Uber', 'Paypal'],
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\`: Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\`: Update the value of the \`key\` if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict the least recently used key**.

The functions \`get\` and \`put\` must each run in **$O(1)$ average time complexity**.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)'
      }
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    starterCode: {
      java: `public class LRUCache {
    public LRUCache(int capacity) {
        // Initialize your cache
    }
    
    public int get(int key) {
        // Return value or -1
        return -1;
    }
    
    public void put(int key, int value) {
        // Update or insert key-value pair
    }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        return -1

    def put(self, key: int, value: int) -> None:
        pass`,
      cpp: `class LRUCache {
public:
    LRUCache(int capacity) {
        
    }
    
    int get(int key) {
        return -1;
    }
    
    void put(int key, int value) {
        
    }
};`,
      javascript: `class LRUCache {
    constructor(capacity) {
        
    }
    
    get(key) {
        return -1;
    }
    
    put(key, value) {
        
    }
}`
    },
    solution: {
      approach: 'Hash Map + Doubly Linked List with Pseudo Head and Tail',
      timeComplexity: 'O(1) for both get() and put() operations',
      spaceComplexity: 'O(capacity) - Memory bounded by maximum capacity',
      explanation: `1. **Doubly Linked List**: Allows O(1) removal and insertion of any node anywhere in the list when given node reference.
2. **Hash Map**: Maps \`key -> Node\` for O(1) access to nodes.
3. **Pseudo Head & Tail**: Sentinel dummy nodes eliminate edge cases when inserting/removing at boundaries.
4. **Get**: Lookup node in map. If exists, move node to head (most recently used) and return value.
5. **Put**: If key exists, update value and move to head. If new key, add to head. If capacity exceeded, remove node from tail (least recently used) and delete from map.`,
      keyTakeaways: [
        'Combining HashMap with Doubly Linked List is the classic solution for O(1) LRU eviction.',
        'Dummy head and tail sentinels prevent null pointer checks on edge nodes.',
        'Frequently asked in system design and senior engineering interviews.'
      ],
      code: {
        java: `import java.util.HashMap;
import java.util.Map;

public class LRUCache {
    class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) { key = k; value = v; }
    }
    
    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }
    
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insertHead(node);
        return node.value;
    }
    
    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        if (map.size() == capacity) {
            map.remove(tail.prev.key);
            remove(tail.prev);
        }
        Node node = new Node(key, value);
        insertHead(node);
        map.put(key, node);
    }
    
    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    private void insertHead(Node node) {
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }
}`,
        python: `class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_head(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        elif len(self.cache) >= self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
            
        new_node = Node(key, value)
        self._add_head(new_node)
        self.cache[key] = new_node

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_head(self, node):
        node.next = self.head.next
        node.next.prev = node
        self.head.next = node
        node.prev = self.head`,
        cpp: `#include <unordered_map>
using namespace std;

class LRUCache {
    struct Node {
        int key, value;
        Node* prev;
        Node* next;
        Node(int k, int v) : key(k), value(v), prev(nullptr), next(nullptr) {}
    };
    
    int cap;
    unordered_map<int, Node*> cache;
    Node* head;
    Node* tail;

    void remove(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void insertHead(Node* node) {
        node->next = head->next;
        node->next->prev = node;
        head->next = node;
        node->prev = head;
    }

public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head->next = tail;
        tail->prev = head;
    }
    
    int get(int key) {
        if (cache.find(key) == cache.end()) return -1;
        Node* node = cache[key];
        remove(node);
        insertHead(node);
        return node->value;
    }
    
    void put(int key, int value) {
        if (cache.find(key) != cache.end()) {
            remove(cache[key]);
        } else if (cache.size() >= cap) {
            Node* lru = tail->prev;
            remove(lru);
            cache.erase(lru->key);
            delete lru;
        }
        Node* node = new Node(key, value);
        insertHead(node);
        cache[key] = node;
    }
};`,
        javascript: `class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map(); // JavaScript Map preserves insertion order
    }
    
    get(key) {
        if (!this.map.has(key)) return -1;
        const val = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, val); // Refresh recency
        return val;
    }
    
    put(key, value) {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.capacity) {
            const firstKey = this.map.keys().next().value;
            this.map.delete(firstKey); // Evict least recently used
        }
        this.map.set(key, value);
    }
}`
      }
    },
    testCases: [
      { id: 1, input: 'Capacity = 2, put(1, 1), put(2, 2), get(1)', expected: '1', explanation: 'Key 1 retrieved and promoted to MRU' },
      { id: 2, input: 'put(3, 3) with capacity 2', expected: 'Evicts Key 2', explanation: 'Key 2 is LRU and evicted' },
      { id: 3, input: 'get(2)', expected: '-1', explanation: 'Key 2 was evicted and returns -1' }
    ]
  }
];

