package com.fyp.placement.controller;

import com.fyp.placement.dto.CodeExecuteRequest;
import com.fyp.placement.dto.CodeExecuteResponse;
import com.fyp.placement.entity.User;
import com.fyp.placement.service.AuthService;
import com.fyp.placement.service.CodingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coding")
public class CodingController {

    private final CodingService codingService;
    private final AuthService authService;

    public CodingController(CodingService codingService, AuthService authService) {
        this.codingService = codingService;
        this.authService = authService;
    }

    @PostMapping("/execute")
    public ResponseEntity<CodeExecuteResponse> executeCode(@AuthenticationPrincipal UserDetails userDetails,
                                                           @RequestBody CodeExecuteRequest request) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(codingService.executeCode(user, request));
    }
}
