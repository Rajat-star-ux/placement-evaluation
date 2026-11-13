package com.fyp.placement.dto;

public class EvaluationResultDTO {
    private Long evaluationId;
    private int technicalScore;
    private int communicationScore;
    private int sentimentScore;
    private int overallScore;
    private String constructiveFeedback;
    private String idealAnswer;

    public EvaluationResultDTO() {}

    public Long getEvaluationId() { return evaluationId; }
    public void setEvaluationId(Long evaluationId) { this.evaluationId = evaluationId; }

    public int getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(int technicalScore) { this.technicalScore = technicalScore; }

    public int getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(int communicationScore) { this.communicationScore = communicationScore; }

    public int getSentimentScore() { return sentimentScore; }
    public void setSentimentScore(int sentimentScore) { this.sentimentScore = sentimentScore; }

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }

    public String getConstructiveFeedback() { return constructiveFeedback; }
    public void setConstructiveFeedback(String constructiveFeedback) { this.constructiveFeedback = constructiveFeedback; }

    public String getIdealAnswer() { return idealAnswer; }
    public void setIdealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; }
}
