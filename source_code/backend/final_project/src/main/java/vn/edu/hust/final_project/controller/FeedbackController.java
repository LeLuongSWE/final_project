package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Feedback;
import vn.edu.hust.final_project.entity.User;
import vn.edu.hust.final_project.repository.UserRepository;
import vn.edu.hust.final_project.service.FeedbackService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class FeedbackController {
    
    @Autowired
    private FeedbackService feedbackService;
    
    @Autowired
    private UserRepository userRepository;
    
    // ========== Customer Endpoints ==========
    
    @PostMapping("/feedbacks")
    public ResponseEntity<?> createFeedback(@RequestBody Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long orderId = Long.valueOf(request.get("orderId").toString());
            Integer rating = Integer.valueOf(request.get("rating").toString());
            String comment = request.get("comment") != null ? request.get("comment").toString() : "";
            
            Feedback feedback = feedbackService.createFeedback(orderId, user.getUserId(), rating, comment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("feedbackId", feedback.getFeedbackId());
            response.put("orderId", feedback.getOrderId());
            response.put("rating", feedback.getRating());
            response.put("comment", feedback.getComment());
            response.put("createdAt", feedback.getCreatedAt());
            response.put("message", "Cảm ơn bạn đã đánh giá!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/feedbacks/order/{orderId}")
    public ResponseEntity<?> getFeedbackByOrder(@PathVariable Long orderId) {
        Optional<Feedback> feedback = feedbackService.getFeedbackByOrderId(orderId);
        if (feedback.isPresent()) {
            Feedback f = feedback.get();
            Map<String, Object> response = new HashMap<>();
            response.put("feedbackId", f.getFeedbackId());
            response.put("orderId", f.getOrderId());
            response.put("rating", f.getRating());
            response.put("comment", f.getComment());
            response.put("createdAt", f.getCreatedAt());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.ok(Map.of("hasFeedback", false));
    }
    
    @GetMapping("/feedbacks/my")
    public ResponseEntity<?> getMyFeedbacks() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Feedback> feedbacks = feedbackService.getFeedbacksByUserId(user.getUserId());
            
            List<Map<String, Object>> result = feedbacks.stream().map(f -> {
                Map<String, Object> map = new HashMap<>();
                map.put("feedbackId", f.getFeedbackId());
                map.put("orderId", f.getOrderId());
                map.put("rating", f.getRating());
                map.put("comment", f.getComment());
                map.put("createdAt", f.getCreatedAt());
                return map;
            }).toList();
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/feedbacks/check/{orderId}")
    public ResponseEntity<?> checkFeedbackExists(@PathVariable Long orderId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean exists = feedbackService.hasUserFeedbackForOrder(orderId, user.getUserId());
            return ResponseEntity.ok(Map.of("hasFeedback", exists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ========== Admin Endpoints ==========
    
    @GetMapping("/admin/feedbacks")
    public ResponseEntity<?> getAllFeedbacks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Feedback> feedbacks;
        
        if (startDate != null && endDate != null) {
            feedbacks = feedbackService.getFeedbacksByDateRange(startDate, endDate);
        } else {
            feedbacks = feedbackService.getAllFeedbacks();
        }
        
        List<Map<String, Object>> result = feedbacks.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("feedbackId", f.getFeedbackId());
            map.put("orderId", f.getOrderId());
            map.put("userId", f.getUserId());
            map.put("rating", f.getRating());
            map.put("comment", f.getComment());
            map.put("createdAt", f.getCreatedAt());
            
            // Include user info if available
            if (f.getUser() != null) {
                map.put("username", f.getUser().getUsername());
                map.put("fullName", f.getUser().getFullName());
            }
            
            return map;
        }).toList();
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/admin/feedbacks/stats")
    public ResponseEntity<?> getFeedbackStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> stats = feedbackService.getFeedbackStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }
}
