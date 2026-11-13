package com.fyp.placement.dto;

public class CodeExecuteRequest {
    private String problemTitle;
    private String language;
    private String code;

    public CodeExecuteRequest() {}

    public String getProblemTitle() { return problemTitle; }
    public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
