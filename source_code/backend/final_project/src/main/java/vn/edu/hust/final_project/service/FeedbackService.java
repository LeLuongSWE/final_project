package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.hust.final_project.entity.Feedback;
import vn.edu.hust.final_project.repository.FeedbackRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class FeedbackService {
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    public Feedback createFeedback(Long orderId, Long userId, Integer rating, String comment) {
        // Check if user already submitted feedback for this order
        if (feedbackRepository.existsByOrderIdAndUserId(orderId, userId)) {
            throw new RuntimeException("Bạn đã đánh giá đơn hàng này rồi");
        }
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Đánh giá phải từ 1 đến 5 sao");
        }
        
        Feedback feedback = new Feedback();
        feedback.setOrderId(orderId);
        feedback.setUserId(userId);
        feedback.setRating(rating);
        feedback.setComment(comment);
        
        return feedbackRepository.save(feedback);
    }
    
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<Feedback> getFeedbacksByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        return feedbackRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
    }
    
    public List<Feedback> getFeedbacksByUserId(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }
    
    public Optional<Feedback> getFeedbackByOrderId(Long orderId) {
        return feedbackRepository.findByOrderId(orderId);
    }
    
    public boolean hasUserFeedbackForOrder(Long orderId, Long userId) {
        return feedbackRepository.existsByOrderIdAndUserId(orderId, userId);
    }
    
    public Map<String, Object> getFeedbackStats(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        Map<String, Object> stats = new HashMap<>();
        
        List<Feedback> feedbacks = feedbackRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
        stats.put("totalFeedbacks", feedbacks.size());
        
        Double avgRating = feedbackRepository.getAverageRatingBetween(start, end);
        stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0);
        
        // Rating distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            Long count = feedbackRepository.countByRatingBetween(i, start, end);
            distribution.put(i, count != null ? count : 0);
        }
        stats.put("ratingDistribution", distribution);
        
        return stats;
    }
}
