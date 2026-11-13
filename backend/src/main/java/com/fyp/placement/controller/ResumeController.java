package com.fyp.placement.controller;

import com.fyp.placement.dto.ResumeAnalyzeRequest;
import com.fyp.placement.dto.ResumeAnalyzeResponse;
import com.fyp.placement.entity.Resume;
import com.fyp.placement.entity.User;
import com.fyp.placement.service.AuthService;
import com.fyp.placement.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final AuthService authService;

    public ResumeController(ResumeService resumeService, AuthService authService) {
        this.resumeService = resumeService;
        this.authService = authService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<ResumeAnalyzeResponse> analyzeResume(@AuthenticationPrincipal UserDetails userDetails,
                                                               @RequestBody ResumeAnalyzeRequest request) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(resumeService.analyzeResume(user, request));
    }

    @GetMapping("/latest")
    public ResponseEntity<Resume> getLatestResume(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.of(resumeService.getLatestResume(user.getId()));
    }
}
