package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.User;
import vn.edu.hust.final_project.entity.Order;
import vn.edu.hust.final_project.entity.OrderItem;
import vn.edu.hust.final_project.entity.Product;
import vn.edu.hust.final_project.repository.UserRepository;
import vn.edu.hust.final_project.repository.OrderRepository;
import vn.edu.hust.final_project.repository.OrderItemRepository;
import vn.edu.hust.final_project.repository.ProductRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== Staff Management ====================
    
    @GetMapping("/staff")
    public ResponseEntity<List<User>> getAllStaff() {
        // Get users with roleId 1 (ADMIN), 2 (CASHIER), 3 (KITCHEN)
        List<User> staff = userRepository.findByRoleIdIn(Arrays.asList(1L, 2L, 3L));
        // Don't return passwords
        staff.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(staff);
    }
    
    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody CreateStaffRequest request) {
        try {
            // Check if username exists
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên đăng nhập đã tồn tại"));
            }
            
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password
            user.setFullName(request.getFullName());
            user.setPhone(request.getPhone());
            user.setRoleId(request.getRoleId());
            
            User saved = userRepository.save(user);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/staff/{userId}")
    public ResponseEntity<?> updateStaff(@PathVariable Long userId, @RequestBody UpdateStaffRequest request) {
        try {
            Optional<User> optUser = userRepository.findById(userId);
            if (optUser.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = optUser.get();
            if (request.getFullName() != null) user.setFullName(request.getFullName());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getRoleId() != null) user.setRoleId(request.getRoleId());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password
            }
            
            User saved = userRepository.save(user);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/staff/{userId}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long userId) {
        try {
            userRepository.deleteById(userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Statistics ====================
    
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Map<String, Object> stats = new HashMap<>();
        
        List<Order> allOrders = orderRepository.findAllByOrderByOrderDateDesc();
        List<Order> filteredOrders = filterOrdersByPeriod(allOrders, period, startDate, endDate);
        
        // Only count completed orders for revenue
        List<Order> completedOrders = filteredOrders.stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()))
                .collect(Collectors.toList());
        
        // Basic stats
        BigDecimal totalRevenue = completedOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalOrders = completedOrders.size();
        BigDecimal avgOrderValue = totalOrders > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;
        
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", totalOrders);
        stats.put("avgOrderValue", avgOrderValue);
        
        // Order by type
        Map<String, Long> ordersByType = filteredOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getOrderType() != null ? o.getOrderType() : "INSTORE",
                        Collectors.counting()
                ));
        stats.put("ordersByType", ordersByType);
        
        // Order by status
        Map<String, Long> ordersByStatus = filteredOrders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
        stats.put("ordersByStatus", ordersByStatus);
        
        // Revenue by hour (for chart)
        Map<Integer, BigDecimal> revenueByHour = new HashMap<>();
        for (int i = 0; i < 24; i++) revenueByHour.put(i, BigDecimal.ZERO);
        
        completedOrders.forEach(order -> {
            int hour = order.getOrderDate().getHour();
            revenueByHour.merge(hour, order.getTotalAmount(), BigDecimal::add);
        });
        stats.put("revenueByHour", revenueByHour);
        
        // Top selling products
        List<Map<String, Object>> topProducts = getTopSellingProducts(filteredOrders, 5);
        stats.put("topProducts", topProducts);
        
        // Payment method breakdown
        Map<String, Long> paymentMethods = completedOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getPaymentMethod() != null ? o.getPaymentMethod() : "UNKNOWN",
                        Collectors.counting()
                ));
        stats.put("paymentMethods", paymentMethods);
        
        // Daily revenue (last 7 days)
        Map<String, BigDecimal> dailyRevenue = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal dayRevenue = completedOrders.stream()
                    .filter(o -> o.getOrderDate().toLocalDate().equals(date))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dailyRevenue.put(date.toString(), dayRevenue);
        }
        stats.put("dailyRevenue", dailyRevenue);
        
        return ResponseEntity.ok(stats);
    }
    
    private List<Order> filterOrdersByPeriod(List<Order> orders, String period, String startDate, String endDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end = now;
        
        if (startDate != null && endDate != null) {
            start = LocalDate.parse(startDate).atStartOfDay();
            end = LocalDate.parse(endDate).plusDays(1).atStartOfDay();
        } else if ("today".equals(period)) {
            start = now.toLocalDate().atStartOfDay();
        } else if ("week".equals(period)) {
            start = now.toLocalDate().minusDays(7).atStartOfDay();
        } else if ("month".equals(period)) {
            start = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        } else {
            return orders; // Return all if no filter
        }
        
        LocalDateTime finalStart = start;
        LocalDateTime finalEnd = end;
        return orders.stream()
                .filter(o -> o.getOrderDate() != null && 
                        o.getOrderDate().isAfter(finalStart) && 
                        o.getOrderDate().isBefore(finalEnd))
                .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getTopSellingProducts(List<Order> orders, int limit) {
        // Get order IDs
        List<Long> orderIds = orders.stream()
                .map(Order::getOrderId)
                .collect(Collectors.toList());
        
        if (orderIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get all order items for these orders
        List<OrderItem> items = orderItemRepository.findByOrder_OrderIdIn(orderIds);
        
        // Group by product and sum quantities
        Map<Long, Integer> productQuantities = items.stream()
                .collect(Collectors.groupingBy(
                        OrderItem::getProductId,
                        Collectors.summingInt(OrderItem::getQuantity)
                ));
        
        // Get product details and sort by quantity
        List<Product> products = productRepository.findAll();
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getProductId, p -> p));
        
        return productQuantities.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    Product p = productMap.get(entry.getKey());
                    item.put("productId", entry.getKey());
                    item.put("name", p != null ? p.getName() : "Unknown");
                    item.put("soldCount", entry.getValue());
                    item.put("revenue", p != null ? p.getPrice().multiply(BigDecimal.valueOf(entry.getValue())) : BigDecimal.ZERO);
                    return item;
                })
                .collect(Collectors.toList());
    }

    // Inner classes for requests
    static class CreateStaffRequest {
        private String username;
        private String password;
        private String fullName;
        private String phone;
        private Long roleId;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Long getRoleId() { return roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
    }
    
    static class UpdateStaffRequest {
        private String password;
        private String fullName;
        private String phone;
        private Long roleId;
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Long getRoleId() { return roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
    }
}
