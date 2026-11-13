package com.fyp.placement.repository;

import com.fyp.placement.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByDomainAndDifficulty(String domain, String difficulty);
    List<Question> findByCompanyTagIgnoreCase(String companyTag);
    List<Question> findByDomainIgnoreCase(String domain);
}
