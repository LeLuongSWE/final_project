package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.Feedback;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findByUserId(Long userId);
    
    Optional<Feedback> findByOrderId(Long orderId);
    
    boolean existsByOrderIdAndUserId(Long orderId, Long userId);
    
    List<Feedback> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    List<Feedback> findAllByOrderByCreatedAtDesc();
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.createdAt BETWEEN :start AND :end")
    Double getAverageRatingBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.rating = :rating AND f.createdAt BETWEEN :start AND :end")
    Long countByRatingBetween(@Param("rating") Integer rating, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getOverallAverageRating();
}
