package com.fyp.placement.service;

import com.fyp.placement.dto.DashboardMetricsResponse;
import com.fyp.placement.entity.CodingSubmission;
import com.fyp.placement.entity.InterviewSession;
import com.fyp.placement.entity.Resume;
import com.fyp.placement.entity.User;
import com.fyp.placement.repository.CodingSubmissionRepository;
import com.fyp.placement.repository.InterviewSessionRepository;
import com.fyp.placement.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    private final InterviewSessionRepository sessionRepository;
    private final ResumeRepository resumeRepository;
    private final CodingSubmissionRepository codingRepository;

    public AnalyticsService(InterviewSessionRepository sessionRepository,
                            ResumeRepository resumeRepository,
                            CodingSubmissionRepository codingRepository) {
        this.sessionRepository = sessionRepository;
        this.resumeRepository = resumeRepository;
        this.codingRepository = codingRepository;
    }

    public DashboardMetricsResponse getMetrics(User user) {
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<CodingSubmission> submissions = codingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        Optional<Resume> resumeOpt = resumeRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());

        int totalInterviews = sessions.size();
        double avgScore = sessions.isEmpty() ? 0.0 :
                sessions.stream()
                        .mapToDouble(InterviewSession::getOverallScore)
                        .average()
                        .orElse(0.0);

        int atsScore = resumeOpt.map(Resume::getAtsScore).orElse(0);
        int codingCount = submissions.size();

        // Calculate genuine domain scores based on user practice. All start at 0 for new user!
        Map<String, Integer> domainScores = new LinkedHashMap<>();
        domainScores.put("Java Core", calculateDomainAverage(sessions, "JAVA"));
        int dsaFromCoding = (int) Math.min(100, submissions.stream().filter(s -> "ACCEPTED".equalsIgnoreCase(s.getStatus())).count() * 20);
        int dsaFromInterview = calculateDomainAverage(sessions, "DSA");
        domainScores.put("Data Structures", Math.max(dsaFromCoding, dsaFromInterview));
        domainScores.put("System Design", calculateDomainAverage(sessions, "SYSTEM_DESIGN"));
        domainScores.put("Behavioral / HR", calculateDomainAverage(sessions, "BEHAVIORAL"));
        domainScores.put("Database & SQL", calculateDomainAverage(sessions, "SQL"));

        // Compile genuine user practice activity timeline
        List<Map<String, Object>> activityList = new ArrayList<>();
        for (InterviewSession s : sessions) {
            Map<String, Object> item = new HashMap<>();
            item.put("type", "MOCK_INTERVIEW");
            item.put("title", s.getTitle() != null && !s.getTitle().isBlank() ? s.getTitle() : (s.getDomain() + " Mock Interview"));
            item.put("score", (int) Math.round(s.getOverallScore()));
            item.put("date", s.getCreatedAt() != null ? s.getCreatedAt().toString().split("T")[0] : "");
            activityList.add(item);
        }
        for (CodingSubmission c : submissions) {
            Map<String, Object> item = new HashMap<>();
            item.put("type", "CODING_CHALLENGE");
            item.put("title", c.getProblemTitle() != null ? c.getProblemTitle() : "Coding Challenge");
            item.put("score", "ACCEPTED".equalsIgnoreCase(c.getStatus()) ? 100 : 50);
            item.put("date", c.getCreatedAt() != null ? c.getCreatedAt().toString().split("T")[0] : "");
            activityList.add(item);
        }
        if (resumeOpt.isPresent()) {
            Resume r = resumeOpt.get();
            Map<String, Object> item = new HashMap<>();
            item.put("type", "RESUME_ATS");
            item.put("title", "ATS Resume Scan (" + r.getTargetJobRole() + ")");
            item.put("score", r.getAtsScore());
            item.put("date", r.getCreatedAt() != null ? r.getCreatedAt().toString().split("T")[0] : "");
            activityList.add(item);
        }

        // Limit to 6 most recent activities
        List<Map<String, Object>> recentActivities = activityList.size() > 6 
                ? activityList.subList(0, 6) 
                : activityList;

        return new DashboardMetricsResponse(
                totalInterviews,
                Math.round(avgScore * 10.0) / 10.0,
                atsScore,
                codingCount,
                domainScores,
                recentActivities
        );
    }

    private int calculateDomainAverage(List<InterviewSession> sessions, String domainPrefix) {
        if (sessions == null || sessions.isEmpty()) return 0;
        OptionalDouble avg = sessions.stream()
                .filter(s -> s.getDomain() != null && s.getDomain().toUpperCase().contains(domainPrefix.toUpperCase()))
                .mapToDouble(InterviewSession::getOverallScore)
                .average();
        return avg.isPresent() ? (int) Math.round(avg.getAsDouble()) : 0;
    }
}
