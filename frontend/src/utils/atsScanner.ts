import type { ResumeAnalysis } from '../types';

// Target role keyword benchmarks for recruiter and campus placement ATS systems
export const ROLE_TARGET_KEYWORDS: Record<string, string[]> = {
  'Software Development Engineer': [
    'Java', 'Python', 'C++', 'Data Structures', 'Algorithms', 'Object-Oriented Programming',
    'Spring Boot', 'SQL', 'MySQL', 'PostgreSQL', 'REST APIs', 'Git', 'System Design',
    'Docker', 'Kubernetes', 'Microservices', 'Redis', 'Kafka', 'Linux', 'JUnit',
    'Unit Testing', 'CI/CD', 'AWS', 'Design Patterns', 'Concurrency'
  ],
  'Frontend Developer': [
    'JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Redux', 'REST APIs', 'Git',
    'Next.js', 'Tailwind CSS', 'Bootstrap', 'Webpack', 'Vite', 'Jest', 'Responsive Design',
    'GraphQL', 'Web Performance', 'DOM', 'Axios', 'SASS', 'UI/UX', 'Single Page Applications'
  ],
  'Backend Developer': [
    'Java', 'Python', 'Node.js', 'Spring Boot', 'Express', 'SQL', 'PostgreSQL', 'MySQL',
    'MongoDB', 'REST APIs', 'Microservices', 'Docker', 'Kubernetes', 'Redis', 'Kafka',
    'AWS', 'Hibernate', 'JPA', 'System Design', 'Linux', 'Git', 'CI/CD', 'JUnit', 'OAuth2'
  ],
  'Data Engineer / Analyst': [
    'Python', 'SQL', 'Pandas', 'NumPy', 'Apache Spark', 'PySpark', 'ETL', 'Tableau',
    'Power BI', 'Data Warehousing', 'Machine Learning', 'Statistics', 'PostgreSQL',
    'Snowflake', 'BigQuery', 'Airflow', 'Kafka', 'Data Modeling', 'Scikit-learn', 'AWS', 'Git'
  ]
};

// Cross-functional technical keywords checked across software engineering roles
export const COMMON_TECH_KEYWORDS = [
  'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS', 'Azure', 'GCP',
  'REST APIs', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'JUnit', 'TDD', 'Maven', 'Gradle',
  'Jira', 'Postman', 'Bash', 'Shell Scripting', 'Redis', 'Elasticsearch', 'Nginx'
];

// Strong action verbs valued by technical screeners
export const ACTION_VERBS = [
  'architected', 'designed', 'developed', 'built', 'implemented', 'engineered',
  'optimized', 'deployed', 'refactored', 'automated', 'scaled', 'led', 'reduced',
  'improved', 'spearheaded', 'integrated', 'orchestrated', 'migrated', 'collaborated'
];

/**
 * Checks whether a keyword is present in resume text with word boundary protection
 * to avoid false matches (e.g., 'Java' should not match inside 'JavaScript').
 */
export function matchesKeyword(text: string, keyword: string): boolean {
  const lowerKeyword = keyword.toLowerCase();

  if (lowerKeyword === 'java') {
    return /\bjava\b(?!script)/i.test(text);
  }
  if (lowerKeyword === 'c++') {
    return /(\bc\+\+|\bcplusplus\b)/i.test(text);
  }
  if (lowerKeyword === 'c#') {
    return /(\bc#|\bcsharp\b)/i.test(text);
  }
  if (lowerKeyword === '.net') {
    return /(\.net|\bdotnet\b)/i.test(text);
  }
  if (lowerKeyword === 'r') {
    return /\b(r\s+language|r\s+programming)\b|(?<=\s|^)r(?=[,;\s]|$)/i.test(text);
  }
  if (lowerKeyword === 'git') {
    return /\bgit\b/i.test(text);
  }
  if (lowerKeyword === 'sql') {
    return /\bsql\b/i.test(text);
  }

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
  return regex.test(text);
}

export interface DetailedATSScoreBreakdown {
  keywordScore: number;
  impactScore: number;
  structureScore: number;
  lengthScore: number;
  matchedCount: number;
  totalTargetKeywords: number;
  metricCount: number;
  verbCount: number;
  wordCount: number;
}

export interface FullResumeAnalysis extends ResumeAnalysis {
  breakdown: DetailedATSScoreBreakdown;
}

/**
 * Perform real-time ATS scanning on candidate resume text.
 * Calculates exact dynamic scores based on:
 * - Target keyword density & coverage (45%)
 * - Quantifiable impact & engineering action verbs (25%)
 * - Standard resume section structure (15%)
 * - Readability and word length (15%)
 */
export function calculateRealtimeATSAnalysis(
  resumeText: string,
  targetJobRole: string
): FullResumeAnalysis {
  const role = targetJobRole || 'Software Development Engineer';
  const text = resumeText || '';
  const lowerText = text.toLowerCase();

  const targetBenchmark = ROLE_TARGET_KEYWORDS[role] || ROLE_TARGET_KEYWORDS['Software Development Engineer'];

  // 1. Keyword Extraction
  const extractedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of targetBenchmark) {
    if (matchesKeyword(text, skill)) {
      extractedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Supplementary common skills
  for (const commonSkill of COMMON_TECH_KEYWORDS) {
    if (matchesKeyword(text, commonSkill) && !extractedSkills.includes(commonSkill)) {
      extractedSkills.push(commonSkill);
    }
  }

  // 2. Score Categories
  // A. Keyword Coverage (45% weight)
  const targetMatches = extractedSkills.filter((s) => targetBenchmark.includes(s)).length;
  const coverageRatio = targetBenchmark.length > 0 ? targetMatches / targetBenchmark.length : 0;
  // Recruiter benchmark expects ~75% coverage for maximum 100 on keyword category
  const keywordScore = Math.min(100, Math.round(coverageRatio * 100 * 1.35));

  // B. Quantifiable Impact & Action Verbs (25% weight)
  const matchedVerbs = ACTION_VERBS.filter((v) => lowerText.includes(v));
  const verbCount = matchedVerbs.length;
  const verbScore = Math.min(50, Math.round((verbCount / 5) * 50));

  // Match metrics like 45%, 100ms, 10k users, $500, etc.
  const metricRegex = /(\d+(\.\d+)?%|\b\d+\+?\s*(ms|seconds|users|requests|qps|queries|mb|gb|records|clients|customers)\b|\$\d+)/gi;
  const metricMatches = text.match(metricRegex) || [];
  const metricCount = metricMatches.length;
  const metricScore = Math.min(50, Math.round(metricCount * 12.5));
  const impactScore = Math.min(100, verbScore + metricScore);

  // C. Section & Structural Completeness (15% weight)
  let structureScore = 0;
  if (/(contact|email|phone|linkedin|github)/i.test(text)) structureScore += 25;
  if (/(skill|technolog|stack|competenc)/i.test(text)) structureScore += 25;
  if (/(project|experience|work history|employment)/i.test(text)) structureScore += 25;
  if (/(education|degree|university|college|bachelor|b\.tech|b\.e)/i.test(text)) structureScore += 25;

  // D. Content Length & Density (15% weight)
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = words.length;
  let lengthScore = 0;
  if (wordCount < 80) {
    lengthScore = 20;
  } else if (wordCount < 180) {
    lengthScore = 55;
  } else if (wordCount <= 850) {
    lengthScore = 100;
  } else if (wordCount <= 1400) {
    lengthScore = 80;
  } else {
    lengthScore = 65;
  }

  // Composite ATS Score
  const rawScore =
    keywordScore * 0.45 +
    impactScore * 0.25 +
    structureScore * 0.15 +
    lengthScore * 0.15;

  const finalScore = Math.max(15, Math.min(99, Math.round(rawScore)));

  // 3. Actionable Tailored Recommendations
  const recommendations: string[] = [];
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 4);
    recommendations.push(
      `Boost ATS Keyword Coverage by integrating high-priority target skills: ${topMissing.join(', ')}.`
    );
  }
  if (metricCount < 2) {
    recommendations.push(
      'Add measurable impact metrics to your bullet points (e.g. "Reduced query latency by 45%", "Scaled backend to 5,000+ daily active users").'
    );
  }
  if (verbCount < 3) {
    recommendations.push(
      'Strengthen project bullets using impactful action verbs like "Architected", "Optimized", "Engineered", and "Deployed".'
    );
  }
  if (!lowerText.includes('github') && !lowerText.includes('linkedin')) {
    recommendations.push(
      'Include clickable GitHub repository and LinkedIn profile links in your contact section to prove code ownership.'
    );
  }
  if (wordCount < 200) {
    recommendations.push(
      `Your resume content is relatively brief (${wordCount} words). Expand project descriptions with architecture details and tech stack breakdown.`
    );
  }

  return {
    atsScore: finalScore,
    targetJobRole: role,
    extractedSkills,
    missingSkills,
    recommendations,
    breakdown: {
      keywordScore,
      impactScore,
      structureScore,
      lengthScore,
      matchedCount: targetMatches,
      totalTargetKeywords: targetBenchmark.length,
      metricCount,
      verbCount,
      wordCount
    }
  };
}

