package com.fyp.placement.repository;

import com.fyp.placement.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    List<CodingSubmission> findByUserIdOrderByCreatedAtDesc(Long userId);
}
