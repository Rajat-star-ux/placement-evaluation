package com.fyp.placement.dto;

import java.util.List;

public class ResumeAnalyzeResponse {
    private int atsScore;
    private String targetJobRole;
    private List<String> extractedSkills;
    private List<String> missingSkills;
    private List<String> recommendations;

    public ResumeAnalyzeResponse() {}

    public ResumeAnalyzeResponse(int atsScore, String targetJobRole, List<String> extractedSkills, List<String> missingSkills, List<String> recommendations) {
        this.atsScore = atsScore;
        this.targetJobRole = targetJobRole;
        this.extractedSkills = extractedSkills;
        this.missingSkills = missingSkills;
        this.recommendations = recommendations;
    }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public String getTargetJobRole() { return targetJobRole; }
    public void setTargetJobRole(String targetJobRole) { this.targetJobRole = targetJobRole; }

    public List<String> getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(List<String> extractedSkills) { this.extractedSkills = extractedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
