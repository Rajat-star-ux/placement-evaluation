package com.fyp.placement.dto;

public class CodeExecuteResponse {
    private String status;
    private int runtimeMs;
    private String output;
    private String aiComplexityReview;

    public CodeExecuteResponse() {}

    public CodeExecuteResponse(String status, int runtimeMs, String output, String aiComplexityReview) {
        this.status = status;
        this.runtimeMs = runtimeMs;
        this.output = output;
        this.aiComplexityReview = aiComplexityReview;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRuntimeMs() { return runtimeMs; }
    public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public String getAiComplexityReview() { return aiComplexityReview; }
    public void setAiComplexityReview(String aiComplexityReview) { this.aiComplexityReview = aiComplexityReview; }
}
