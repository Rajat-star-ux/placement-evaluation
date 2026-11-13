package com.fyp.placement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_submissions")
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String problemTitle;
    private String language;

    @Column(length = 5000)
    private String code;

    private String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, SYNTAX_ERROR
    private int runtimeMs;

    @Column(length = 2000)
    private String aiComplexityReview;

    private LocalDateTime createdAt = LocalDateTime.now();

    public CodingSubmission() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getProblemTitle() { return problemTitle; }
    public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRuntimeMs() { return runtimeMs; }
    public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

    public String getAiComplexityReview() { return aiComplexityReview; }
    public void setAiComplexityReview(String aiComplexityReview) { this.aiComplexityReview = aiComplexityReview; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
