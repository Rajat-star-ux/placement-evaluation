package com.fyp.placement.controller;

import com.fyp.placement.entity.Question;
import com.fyp.placement.repository.QuestionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionRepository.findAll());
    }

    @GetMapping("/company-kits")
    public ResponseEntity<Map<String, List<Question>>> getCompanyKits() {
        List<Question> all = questionRepository.findAll();
        Map<String, List<Question>> grouped = all.stream()
                .filter(q -> q.getCompanyTag() != null && !q.getCompanyTag().isBlank())
                .collect(Collectors.groupingBy(Question::getCompanyTag));
        return ResponseEntity.ok(grouped);
    }
}
