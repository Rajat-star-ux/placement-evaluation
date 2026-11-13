package com.fyp.placement.dto;

public class ResumeAnalyzeRequest {
    private String resumeText;
    private String fileName;
    private String targetJobRole;

    public ResumeAnalyzeRequest() {}

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getTargetJobRole() { return targetJobRole; }
    public void setTargetJobRole(String targetJobRole) { this.targetJobRole = targetJobRole; }
}
