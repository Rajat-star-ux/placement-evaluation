package com.fyp.placement.repository;

import com.fyp.placement.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, Long> {
    List<InterviewEvaluation> findBySessionId(Long sessionId);
}
