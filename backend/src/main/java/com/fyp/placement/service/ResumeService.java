package com.fyp.placement.service;

import com.fyp.placement.dto.ResumeAnalyzeRequest;
import com.fyp.placement.dto.ResumeAnalyzeResponse;
import com.fyp.placement.entity.Resume;
import com.fyp.placement.entity.User;
import com.fyp.placement.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;

    // Role-specific Core Required & Recommended Keyword Benchmarks
    private static final Map<String, List<String>> ROLE_TARGET_SKILLS = Map.of(
            "Software Development Engineer", List.of(
                    "Java", "Python", "C++", "Data Structures", "Algorithms", "Object-Oriented Programming",
                    "Spring Boot", "SQL", "MySQL", "PostgreSQL", "REST APIs", "Git", "System Design",
                    "Docker", "Kubernetes", "Microservices", "Redis", "Kafka", "Linux", "JUnit",
                    "Unit Testing", "CI/CD", "AWS", "Design Patterns", "Concurrency"
            ),
            "Frontend Developer", List.of(
                    "JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Redux", "REST APIs", "Git",
                    "Next.js", "Tailwind CSS", "Bootstrap", "Webpack", "Vite", "Jest", "Responsive Design",
                    "GraphQL", "Web Performance", "DOM", "Axios", "SASS", "UI/UX", "Single Page Applications"
            ),
            "Backend Developer", List.of(
                    "Java", "Python", "Node.js", "Spring Boot", "Express", "SQL", "PostgreSQL", "MySQL",
                    "MongoDB", "REST APIs", "Microservices", "Docker", "Kubernetes", "Redis", "Kafka",
                    "AWS", "Hibernate", "JPA", "System Design", "Linux", "Git", "CI/CD", "JUnit", "OAuth2"
            ),
            "Data Engineer / Analyst", List.of(
                    "Python", "SQL", "Pandas", "NumPy", "Apache Spark", "PySpark", "ETL", "Tableau",
                    "Power BI", "Data Warehousing", "Machine Learning", "Statistics", "PostgreSQL",
                    "Snowflake", "BigQuery", "Airflow", "Kafka", "Data Modeling", "Scikit-learn", "AWS", "Git"
            )
    );

    // Cross-domain technical keywords recognized by modern campus ATS
    private static final List<String> COMMON_TECH_KEYWORDS = List.of(
            "Git", "GitHub", "GitLab", "Docker", "Kubernetes", "CI/CD", "Linux", "AWS", "Azure", "GCP",
            "REST APIs", "GraphQL", "Microservices", "Agile", "Scrum", "JUnit", "TDD", "Maven", "Gradle",
            "Jira", "Postman", "Bash", "Shell Scripting", "Redis", "Elasticsearch", "Nginx"
    );

    // Strong Action Verbs evaluated by ATS parser
    private static final List<String> ACTION_VERBS = List.of(
            "architected", "designed", "developed", "built", "implemented", "engineered",
            "optimized", "deployed", "refactored", "automated", "scaled", "led", "reduced",
            "improved", "spearheaded", "integrated", "orchestrated", "migrated", "collaborated"
    );

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    public ResumeAnalyzeResponse analyzeResume(User user, ResumeAnalyzeRequest request) {
        String targetRole = (request.getTargetJobRole() != null && !request.getTargetJobRole().isBlank())
                ? request.getTargetJobRole()
                : (user.getTargetRole() != null ? user.getTargetRole() : "Software Development Engineer");

        String text = request.getResumeText() != null ? request.getResumeText() : "";
        String lowerText = text.toLowerCase();

        List<String> targetBenchmark = ROLE_TARGET_SKILLS.getOrDefault(
                targetRole, ROLE_TARGET_SKILLS.get("Software Development Engineer")
        );

        // 1. Keyword Extraction (Word Boundary Regex Matching)
        List<String> extractedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : targetBenchmark) {
            if (matchesKeyword(lowerText, skill)) {
                extractedSkills.add(skill);
            } else {
                missingSkills.add(skill);
            }
        }

        // Scan supplementary common engineering skills
        for (String commonSkill : COMMON_TECH_KEYWORDS) {
            if (matchesKeyword(lowerText, commonSkill) && !extractedSkills.contains(commonSkill)) {
                extractedSkills.add(commonSkill);
            }
        }

        // 2. Multi-dimensional ATS Scoring Model
        // Category A: Keyword Match Density (45% weight)
        double targetCoverage = targetBenchmark.isEmpty() ? 0 :
                (double) extractedSkills.stream().filter(targetBenchmark::contains).count() / targetBenchmark.size();
        double keywordScore = Math.min(100.0, targetCoverage * 100.0 * 1.35); // Benchmark expectation is ~75% coverage for 100

        // Category B: Quantifiable Achievements & Action Verbs (25% weight)
        long verbCount = ACTION_VERBS.stream().filter(lowerText::contains).count();
        double verbScore = Math.min(100.0, (verbCount / 5.0) * 50.0);

        // Quantifiable metrics: numbers followed by %, ms, x, k, users, etc.
        Pattern metricPattern = Pattern.compile("(\\d+(\\.\\d+)?%|\\b\\d+\\+?\\s*(ms|seconds|users|requests|qps|queries|mb|gb|records|clients|customers)\\b|\\$\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher metricMatcher = metricPattern.matcher(text);
        int metricCount = 0;
        while (metricMatcher.find()) {
            metricCount++;
        }
        double metricScore = Math.min(50.0, metricCount * 12.5);
        double impactScore = Math.min(100.0, verbScore + metricScore);

        // Category C: Section & Structural Completeness (15% weight)
        double structureScore = 0.0;
        if (Pattern.compile("(contact|email|phone|linkedin|github)", Pattern.CASE_INSENSITIVE).matcher(text).find()) structureScore += 25.0;
        if (Pattern.compile("(skill|technolog|stack|competenc)", Pattern.CASE_INSENSITIVE).matcher(text).find()) structureScore += 25.0;
        if (Pattern.compile("(project|experience|work history|employment)", Pattern.CASE_INSENSITIVE).matcher(text).find()) structureScore += 25.0;
        if (Pattern.compile("(education|degree|university|college|bachelor|b\\.tech|b\\.e)", Pattern.CASE_INSENSITIVE).matcher(text).find()) structureScore += 25.0;

        // Category D: Content Length & Quality (15% weight)
        int wordCount = text.trim().isEmpty() ? 0 : text.trim().split("\\s+").length;
        double lengthScore;
        if (wordCount < 80) {
            lengthScore = 20.0;
        } else if (wordCount < 180) {
            lengthScore = 55.0;
        } else if (wordCount <= 850) {
            lengthScore = 100.0;
        } else if (wordCount <= 1400) {
            lengthScore = 80.0;
        } else {
            lengthScore = 65.0;
        }

        // Total Weighted Score (Real-time dynamic composite)
        double totalWeighted = (keywordScore * 0.45) + (impactScore * 0.25) + (structureScore * 0.15) + (lengthScore * 0.15);
        int finalAtsScore = (int) Math.round(totalWeighted);
        finalAtsScore = Math.max(15, Math.min(99, finalAtsScore));

        // 3. Dynamic Tailored Recommendations
        List<String> recommendations = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            List<String> topMissing = missingSkills.subList(0, Math.min(4, missingSkills.size()));
            recommendations.add("Boost ATS Keyword Coverage by integrating high-priority target skills: " + String.join(", ", topMissing) + ".");
        }
        if (metricCount < 2) {
            recommendations.add("Add measurable impact metrics to your bullet points (e.g., 'Reduced query latency by 45%', 'Scaled backend to 5,000+ daily active users').");
        }
        if (verbCount < 3) {
            recommendations.add("Strengthen bullet points using impactful action verbs like 'Architected', 'Optimized', 'Engineered', and 'Deployed'.");
        }
        if (!lowerText.contains("github") && !lowerText.contains("linkedin")) {
            recommendations.add("Include clickable GitHub repository and LinkedIn profile links in your contact section to prove code ownership.");
        }
        if (wordCount < 200) {
            recommendations.add("Your resume content is relatively brief (" + wordCount + " words). Expand project descriptions with architecture details and tech stack breakdown.");
        }

        // Persist scan result to repository
        Resume resume = new Resume();
        resume.setUserId(user.getId());
        resume.setFileName(request.getFileName() != null ? request.getFileName() : "resume.pdf");
        resume.setParsedText(text.length() > 4000 ? text.substring(0, 4000) : text);
        resume.setExtractedSkills(String.join(", ", extractedSkills));
        resume.setTargetJobRole(targetRole);
        resume.setAtsScore(finalAtsScore);
        resume.setMissingSkills(String.join(", ", missingSkills));
        resume.setRecommendations(String.join("; ", recommendations));

        resumeRepository.save(resume);

        return new ResumeAnalyzeResponse(finalAtsScore, targetRole, extractedSkills, missingSkills, recommendations);
    }

    public Optional<Resume> getLatestResume(Long userId) {
        return resumeRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Precise keyword matching avoiding substring false-positives (e.g. 'Java' matching inside 'JavaScript').
     */
    private boolean matchesKeyword(String text, String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        if (lowerKeyword.equals("java")) {
            return Pattern.compile("\\bjava\\b(?!script)", Pattern.CASE_INSENSITIVE).matcher(text).find();
        }
        if (lowerKeyword.equals("c++")) {
            return Pattern.compile("(\\bc\\+\\+|\\bcplusplus\\b)", Pattern.CASE_INSENSITIVE).matcher(text).find();
        }
        if (lowerKeyword.equals("c#")) {
            return Pattern.compile("(\\bc#|\\bcsharp\\b)", Pattern.CASE_INSENSITIVE).matcher(text).find();
        }
        if (lowerKeyword.equals(".net")) {
            return Pattern.compile("(\\.net|\\bdotnet\\b)", Pattern.CASE_INSENSITIVE).matcher(text).find();
        }
        if (lowerKeyword.equals("r")) {
            return Pattern.compile("\\b(r\\s+language|r\\s+programming)\\b|(?<=\\s|^)r(?=[,;\\s]|$)", Pattern.CASE_INSENSITIVE).matcher(text).find();
        }
        if (lowerKeyword.equals("git")) {
            return Pattern.compile("\\bgit\\b", Pattern.CASE_INSENSITIVE).matcher(text).find();
        }
        if (lowerKeyword.equals("sql")) {
            return Pattern.compile("\\bsql\\b", Pattern.CASE_INSENSITIVE).matcher(text).find();
        }

        String escaped = Pattern.quote(lowerKeyword);
        Pattern pattern = Pattern.compile("(^|[^a-zA-Z0-9])" + escaped + "([^a-zA-Z0-9]|$)", Pattern.CASE_INSENSITIVE);
        return pattern.matcher(text).find();
    }
}
