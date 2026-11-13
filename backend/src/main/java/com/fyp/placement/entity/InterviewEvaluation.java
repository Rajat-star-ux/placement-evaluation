package com.fyp.placement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "interview_evaluations")
public class InterviewEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    @JsonIgnore
    private InterviewSession session;

    private Long questionId;
    
    @Column(length = 2000)
    private String questionText;

    @Column(length = 4000)
    private String candidateAnswer;

    private int technicalScore; // 0 - 100
    private int communicationScore; // 0 - 100
    private int sentimentScore; // 0 - 100
    private int overallScore; // 0 - 100

    @Column(length = 2000)
    private String constructiveFeedback;

    @Column(length = 2000)
    private String idealAnswer;

    public InterviewEvaluation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getCandidateAnswer() { return candidateAnswer; }
    public void setCandidateAnswer(String candidateAnswer) { this.candidateAnswer = candidateAnswer; }

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
