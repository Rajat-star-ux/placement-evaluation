package com.fyp.placement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String domain; // e.g. JAVA, DSA, SYSTEM_DESIGN, BEHAVIORAL, QUANT
    private String difficulty; // EASY, MEDIUM, HARD
    
    @Column(length = 2000)
    private String text;

    @Column(length = 2000)
    private String sampleAnswer;

    private String companyTag; // e.g. Amazon, TCS, Infosys, Google, General

    private String expectedKeywords; // Comma separated key phrases for NLP scoring

    public Question() {}

    public Question(String title, String domain, String difficulty, String text, String sampleAnswer, String companyTag, String expectedKeywords) {
        this.title = title;
        this.domain = domain;
        this.difficulty = difficulty;
        this.text = text;
        this.sampleAnswer = sampleAnswer;
        this.companyTag = companyTag;
        this.expectedKeywords = expectedKeywords;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getSampleAnswer() { return sampleAnswer; }
    public void setSampleAnswer(String sampleAnswer) { this.sampleAnswer = sampleAnswer; }

    public String getCompanyTag() { return companyTag; }
    public void setCompanyTag(String companyTag) { this.companyTag = companyTag; }

    public String getExpectedKeywords() { return expectedKeywords; }
    public void setExpectedKeywords(String expectedKeywords) { this.expectedKeywords = expectedKeywords; }
}
