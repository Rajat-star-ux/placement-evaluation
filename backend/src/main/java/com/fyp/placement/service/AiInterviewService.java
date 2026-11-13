package com.fyp.placement.service;

import com.fyp.placement.dto.EvaluationResultDTO;
import com.fyp.placement.dto.StartInterviewRequest;
import com.fyp.placement.dto.SubmitAnswerRequest;
import com.fyp.placement.entity.InterviewEvaluation;
import com.fyp.placement.entity.InterviewSession;
import com.fyp.placement.entity.Question;
import com.fyp.placement.entity.User;
import com.fyp.placement.repository.InterviewEvaluationRepository;
import com.fyp.placement.repository.InterviewSessionRepository;
import com.fyp.placement.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AiInterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final QuestionRepository questionRepository;

    public AiInterviewService(InterviewSessionRepository sessionRepository,
                              InterviewEvaluationRepository evaluationRepository,
                              QuestionRepository questionRepository) {
        this.sessionRepository = sessionRepository;
        this.evaluationRepository = evaluationRepository;
        this.questionRepository = questionRepository;
    }

    public InterviewSession startSession(User user, StartInterviewRequest request) {
        String title = (request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle()
                : (request.getDomain() + " - " + request.getDifficulty() + " Interview");

        InterviewSession session = new InterviewSession(
                user.getId(),
                title,
                request.getDomain() != null ? request.getDomain() : "JAVA",
                request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM"
        );

        return sessionRepository.save(session);
    }

    public List<Question> getSessionQuestions(String domain, String difficulty, String companyTag) {
        if (companyTag != null && !companyTag.isBlank()) {
            List<Question> companyQuestions = questionRepository.findByCompanyTagIgnoreCase(companyTag);
            if (!companyQuestions.isEmpty()) return companyQuestions;
        }

        List<Question> questions = questionRepository.findByDomainAndDifficulty(domain, difficulty);
        if (questions.isEmpty()) {
            questions = questionRepository.findByDomainIgnoreCase(domain);
        }
        return questions;
    }

    @Transactional
    public EvaluationResultDTO evaluateAnswer(User user, SubmitAnswerRequest request) {
        InterviewSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        String answerText = request.getCandidateAnswer() != null ? request.getCandidateAnswer().trim() : "";

        int techScore;
        int commScore;
        int sentimentScore;
        int overallScore;
        String feedback;

        if (answerText.isEmpty()) {
            techScore = 0;
            commScore = 0;
            sentimentScore = 0;
            overallScore = 0;
            feedback = "No answer detected. The submission was completely blank or silent. To be evaluated, speak into the microphone and explain the technical concepts required by the model answer.";
        } else {
            // NLP Evaluation Metrics Computation
            techScore = calculateTechnicalScore(answerText, question.getExpectedKeywords(), question.getSampleAnswer());
            commScore = calculateCommunicationScore(answerText);
            sentimentScore = calculateSentimentScore(answerText);
            overallScore = (int) Math.round((techScore * 0.5) + (commScore * 0.3) + (sentimentScore * 0.2));
            feedback = generateFeedback(techScore, commScore, sentimentScore, question.getExpectedKeywords());
        }

        InterviewEvaluation evaluation = new InterviewEvaluation();
        evaluation.setSession(session);
        evaluation.setQuestionId(question.getId());
        evaluation.setQuestionText(question.getText());
        evaluation.setCandidateAnswer(answerText);
        evaluation.setTechnicalScore(techScore);
        evaluation.setCommunicationScore(commScore);
        evaluation.setSentimentScore(sentimentScore);
        evaluation.setOverallScore(overallScore);
        evaluation.setConstructiveFeedback(feedback);
        evaluation.setIdealAnswer(question.getSampleAnswer());

        evaluationRepository.save(evaluation);

        // Update overall session score
        List<InterviewEvaluation> evaluations = evaluationRepository.findBySessionId(session.getId());
        double avgSessionScore = evaluations.stream()
                .mapToInt(InterviewEvaluation::getOverallScore)
                .average()
                .orElse(overallScore);

        session.setOverallScore(Math.round(avgSessionScore * 10.0) / 10.0);
        session.setStatus(evaluations.size() >= 3 ? "COMPLETED" : "IN_PROGRESS");
        sessionRepository.save(session);

        EvaluationResultDTO result = new EvaluationResultDTO();
        result.setEvaluationId(evaluation.getId());
        result.setTechnicalScore(techScore);
        result.setCommunicationScore(commScore);
        result.setSentimentScore(sentimentScore);
        result.setOverallScore(overallScore);
        result.setConstructiveFeedback(feedback);
        result.setIdealAnswer(question.getSampleAnswer());

        return result;
    }

    private int calculateTechnicalScore(String answer, String expectedKeywords, String sampleAnswer) {
        if (answer == null || answer.trim().isEmpty()) return 0;

        String lowerAnswer = answer.toLowerCase().trim();
        String[] words = lowerAnswer.split("\\s+");
        if (words.length < 4) return 5;

        int score = 0;
        // 1. Expected keywords matching
        if (expectedKeywords != null && !expectedKeywords.isBlank()) {
            String[] keywords = expectedKeywords.split(",");
            int matched = 0;
            for (String kw : keywords) {
                if (lowerAnswer.contains(kw.trim().toLowerCase())) {
                    matched++;
                }
            }
            double matchRatio = (double) matched / keywords.length;
            score = (int) Math.round(matchRatio * 75.0);
        } else {
            score = 40;
        }

        // 2. Length heuristic
        if (words.length >= 30) score += 20;
        else if (words.length >= 15) score += 10;
        else score += 5;

        return Math.min(100, Math.max(0, score));
    }

    private int calculateCommunicationScore(String answer) {
        if (answer == null || answer.trim().isEmpty()) return 0;
        String[] words = answer.trim().split("\\s+");
        if (words.length < 4) return 5;

        int score = 20;
        if (words.length >= 30 && words.length <= 130) score = 90;
        else if (words.length >= 15) score = 70;
        else score = 40;

        // Structured response bonus
        if (answer.contains(".") || answer.contains(";") || answer.contains("\n")) score += 10;
        return Math.min(100, Math.max(0, score));
    }

    private int calculateSentimentScore(String answer) {
        if (answer == null || answer.trim().isEmpty()) return 0;
        String lower = answer.toLowerCase().trim();
        String[] words = lower.split("\\s+");
        if (words.length < 4) return 10;

        int score = 65;
        String[] confidentWords = {"implemented", "designed", "optimized", "architecture", "definitely", "because", "result", "achieved", "ensure", "solution", "specifically"};
        for (String w : confidentWords) {
            if (lower.contains(w)) score += 4;
        }

        String[] uncertainWords = {"maybe", "i think", "not sure", "guess", "probably", "i don't know"};
        for (String w : uncertainWords) {
            if (lower.contains(w)) score -= 8;
        }

        return Math.min(100, Math.max(10, score));
    }

    private String generateFeedback(int techScore, int commScore, int sentimentScore, String expectedKeywords) {
        StringBuilder sb = new StringBuilder();

        if (techScore >= 80) {
            sb.append("Great technical accuracy! You covered core concepts clearly.");
        } else if (techScore >= 50) {
            sb.append("Good effort on the technical answer, but make sure to explicitly include key terminology");
            if (expectedKeywords != null) sb.append(" like: ").append(expectedKeywords);
            sb.append(".");
        } else {
            sb.append("Technical answer needs improvement. Focus on explaining foundational principles step-by-step.");
        }

        sb.append(" ");

        if (commScore < 60) {
            sb.append("Try structuring your answer with the STAR method (Situation, Task, Action, Result) for better clarity.");
        } else {
            sb.append("Communication structure was clear and articulate.");
        }

        if (sentimentScore >= 75) {
            sb.append(" High confidence level detected in your response tone!");
        }

        return sb.toString();
    }
}
