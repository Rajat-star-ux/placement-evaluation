package com.fyp.placement.dto;

import java.util.Map;
import java.util.List;

public class DashboardMetricsResponse {
    private int totalInterviews;
    private double averageScore;
    private int latestAtsScore;
    private int codingChallengesCompleted;
    private Map<String, Integer> domainScores; // Domain -> Score (0-100)
    private List<Map<String, Object>> recentActivity;

    public DashboardMetricsResponse() {}

    public DashboardMetricsResponse(int totalInterviews, double averageScore, int latestAtsScore, int codingChallengesCompleted, Map<String, Integer> domainScores, List<Map<String, Object>> recentActivity) {
        this.totalInterviews = totalInterviews;
        this.averageScore = averageScore;
        this.latestAtsScore = latestAtsScore;
        this.codingChallengesCompleted = codingChallengesCompleted;
        this.domainScores = domainScores;
        this.recentActivity = recentActivity;
    }

    public int getTotalInterviews() { return totalInterviews; }
    public void setTotalInterviews(int totalInterviews) { this.totalInterviews = totalInterviews; }

    public double getAverageScore() { return averageScore; }
    public void setAverageScore(double averageScore) { this.averageScore = averageScore; }

    public int getLatestAtsScore() { return latestAtsScore; }
    public void setLatestAtsScore(int latestAtsScore) { this.latestAtsScore = latestAtsScore; }

    public int getCodingChallengesCompleted() { return codingChallengesCompleted; }
    public void setCodingChallengesCompleted(int codingChallengesCompleted) { this.codingChallengesCompleted = codingChallengesCompleted; }

    public Map<String, Integer> getDomainScores() { return domainScores; }
    public void setDomainScores(Map<String, Integer> domainScores) { this.domainScores = domainScores; }

    public List<Map<String, Object>> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<Map<String, Object>> recentActivity) { this.recentActivity = recentActivity; }
}
