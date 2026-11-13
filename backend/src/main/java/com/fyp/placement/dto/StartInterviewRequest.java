package com.fyp.placement.dto;

public class StartInterviewRequest {
    private String domain; // e.g. JAVA, DSA, SYSTEM_DESIGN, BEHAVIORAL, QUANT
    private String difficulty; // EASY, MEDIUM, HARD
    private String title;
    private String companyTag;

    public StartInterviewRequest() {}

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompanyTag() { return companyTag; }
    public void setCompanyTag(String companyTag) { this.companyTag = companyTag; }
}
