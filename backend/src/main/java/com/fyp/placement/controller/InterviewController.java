package com.fyp.placement.controller;

import com.fyp.placement.dto.EvaluationResultDTO;
import com.fyp.placement.dto.StartInterviewRequest;
import com.fyp.placement.dto.SubmitAnswerRequest;
import com.fyp.placement.entity.InterviewSession;
import com.fyp.placement.entity.Question;
import com.fyp.placement.entity.User;
import com.fyp.placement.service.AiInterviewService;
import com.fyp.placement.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final AiInterviewService interviewService;
    private final AuthService authService;

    public InterviewController(AiInterviewService interviewService, AuthService authService) {
        this.interviewService = interviewService;
        this.authService = authService;
    }

    @PostMapping("/start")
    public ResponseEntity<InterviewSession> startSession(@AuthenticationPrincipal UserDetails userDetails,
                                                         @RequestBody StartInterviewRequest request) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(interviewService.startSession(user, request));
    }

    @GetMapping("/questions")
    public ResponseEntity<List<Question>> getQuestions(@RequestParam(defaultValue = "JAVA") String domain,
                                                       @RequestParam(defaultValue = "MEDIUM") String difficulty,
                                                       @RequestParam(required = false) String companyTag) {
        return ResponseEntity.ok(interviewService.getSessionQuestions(domain, difficulty, companyTag));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResultDTO> evaluateAnswer(@AuthenticationPrincipal UserDetails userDetails,
                                                               @RequestBody SubmitAnswerRequest request) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(interviewService.evaluateAnswer(user, request));
    }
}
