package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Order;
import vn.edu.hust.final_project.entity.OrderItem;
import vn.edu.hust.final_project.entity.OrderStatusHistory;
import vn.edu.hust.final_project.entity.Product;
import vn.edu.hust.final_project.repository.OrderRepository;
import vn.edu.hust.final_project.repository.OrderItemRepository;
import vn.edu.hust.final_project.repository.OrderStatusHistoryRepository;
import vn.edu.hust.final_project.repository.ProductRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        return ResponseEntity.ok(orders);
    }

    /**
     * Paginated orders with filters
     * GET
     * /api/orders/search?page=0&size=20&startDate=2025-01-01&endDate=2025-01-31&search=ORD123
     */
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        StringBuilder sql = new StringBuilder();
        sql.append("SELECT o.*, u.full_name as customer_name, u.phone as customer_phone ");
        sql.append("FROM orders o ");
        sql.append("LEFT JOIN users u ON o.user_id = u.user_id ");
        sql.append("WHERE 1=1 ");

        StringBuilder countSql = new StringBuilder();
        countSql.append("SELECT COUNT(*) FROM orders o WHERE 1=1 ");

        java.util.List<Object> params = new java.util.ArrayList<>();
        java.util.List<Object> countParams = new java.util.ArrayList<>();

        // Date filter
        if (startDate != null && !startDate.isEmpty()) {
            sql.append("AND o.order_date >= ?::timestamp ");
            countSql.append("AND o.order_date >= ?::timestamp ");
            params.add(startDate + " 00:00:00");
            countParams.add(startDate + " 00:00:00");
        }
        if (endDate != null && !endDate.isEmpty()) {
            sql.append("AND o.order_date < ?::timestamp ");
            countSql.append("AND o.order_date < ?::timestamp ");
            params.add(endDate + " 23:59:59");
            countParams.add(endDate + " 23:59:59");
        }

        // Status filter
        if (status != null && !status.isEmpty()) {
            sql.append("AND o.status = ? ");
            countSql.append("AND o.status = ? ");
            params.add(status);
            countParams.add(status);
        }

        // Search by order code
        if (search != null && !search.isEmpty()) {
            sql.append("AND (o.order_code ILIKE ? OR CAST(o.order_id AS TEXT) LIKE ?) ");
            countSql.append("AND (o.order_code ILIKE ? OR CAST(o.order_id AS TEXT) LIKE ?) ");
            params.add("%" + search + "%");
            params.add("%" + search + "%");
            countParams.add("%" + search + "%");
            countParams.add("%" + search + "%");
        }

        sql.append("ORDER BY o.order_date DESC ");
        sql.append("LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        // Execute queries
        Long totalCount = jdbcTemplate.queryForObject(countSql.toString(), Long.class, countParams.toArray());
        java.util.List<java.util.Map<String, Object>> orders = jdbcTemplate.queryForList(sql.toString(),
                params.toArray());

        Map<String, Object> result = new HashMap<>();
        result.put("content", orders);
        result.put("totalElements", totalCount != null ? totalCount : 0);
        result.put("totalPages", (int) Math.ceil((double) (totalCount != null ? totalCount : 0) / size));
        result.put("page", page);
        result.put("size", size);
        result.put("hasNext", (page + 1) * size < (totalCount != null ? totalCount : 0));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    // Fetch items and populate product names
                    List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
                    for (OrderItem item : items) {
                        productRepository.findById(item.getProductId())
                                .ifPresent(product -> item.setProductName(product.getName()));
                    }

                    // Fetch status history
                    List<OrderStatusHistory> statusHistory = orderStatusHistoryRepository
                            .findByOrderOrderIdOrderByChangedAtAsc(orderId);

                    // Build response
                    Map<String, Object> response = new HashMap<>();
                    response.put("order", order);
                    response.put("items", items);
                    response.put("statusHistory", statusHistory);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<?> getOrderByCode(@PathVariable String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .map(order -> getOrderById(order.getOrderId()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            // Generate order code
            String orderCode = generateOrderCode();

            // Create order
            Order order = new Order();
            order.setUserId(request.getUserId());
            order.setOrderCode(orderCode);
            order.setTotalAmount(request.getTotalAmount());
            order.setPaymentMethod(request.getPaymentMethod());
            order.setStatus("PENDING");
            order.setEstimatedPickupTime(LocalDateTime.now().plusMinutes(30));

            Order savedOrder = orderRepository.save(order);

            // Create order items
            if (request.getItems() != null) {
                for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                    OrderItem item = new OrderItem();
                    item.setOrder(savedOrder);
                    item.setProductId(itemRequest.getProductId());
                    item.setQuantity(itemRequest.getQuantity());
                    item.setPriceAtPurchase(itemRequest.getPrice());
                    orderItemRepository.save(item);
                }
            }

            // Create initial status history
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrder(savedOrder);
            history.setStatus("PENDING");
            history.setChangedAt(LocalDateTime.now());
            orderStatusHistoryRepository.save(history);

            // Return order with orderId for redirect
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getOrderId());
            response.put("orderCode", savedOrder.getOrderCode());
            response.put("message", "Đơn hàng đã được tạo thành công");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");

        return orderRepository.findById(orderId)
                .map(order -> {
                    order.setStatus(newStatus);
                    orderRepository.save(order);

                    // Add to status history
                    OrderStatusHistory history = new OrderStatusHistory();
                    history.setOrder(order);
                    history.setStatus(newStatus);
                    history.setChangedAt(LocalDateTime.now());
                    orderStatusHistoryRepository.save(history);

                    return ResponseEntity.ok(order);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== CASHIER ENDPOINTS ==========

    @GetMapping("/online/pending")
    public ResponseEntity<?> getPendingOnlineOrders() {
        List<Order> orders = orderRepository.findByOrderTypeAndStatusInOrderByOrderDateAsc(
                "ONLINE",
                List.of("PENDING", "PREPARING", "READY"));

        // Populate items for each order
        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
            for (OrderItem item : items) {
                productRepository.findById(item.getProductId())
                        .ifPresent(product -> item.setProductName(product.getName()));
            }
            order.setItems(items);
        }

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/instore/shift/{shiftId}")
    public ResponseEntity<?> getInstoreOrdersByShift(@PathVariable Long shiftId) {
        List<Order> orders = orderRepository.findByOrderTypeAndShiftIdOrderByOrderDateDesc("INSTORE", shiftId);
        
        // Populate items with product names for each order
        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
            for (OrderItem item : items) {
                productRepository.findById(item.getProductId())
                        .ifPresent(product -> item.setProductName(product.getName()));
            }
            order.setItems(items);
        }
        
        return ResponseEntity.ok(orders);
    }
    
    @PutMapping("/{orderId}/payment")
    public ResponseEntity<?> updateOrderPayment(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String newPaymentMethod = request.get("paymentMethod");
        String newStatus = request.getOrDefault("status", "COMPLETED");
        
        return orderRepository.findById(orderId)
                .map(order -> {
                    order.setPaymentMethod(newPaymentMethod);
                    order.setStatus(newStatus);
                    orderRepository.save(order);
                    
                    // Add to status history
                    OrderStatusHistory history = new OrderStatusHistory();
                    history.setOrder(order);
                    history.setStatus(newStatus);
                    history.setChangedAt(LocalDateTime.now());
                    orderStatusHistoryRepository.save(history);
                    
                    return ResponseEntity.ok(order);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/instore")
    public ResponseEntity<?> createInstoreOrder(@RequestBody CreateInstoreOrderRequest request) {
        try {
            String orderCode = generateOrderCode();

            Order order = new Order();
            order.setOrderCode(orderCode);
            order.setTotalAmount(request.getTotalAmount());
            order.setPaymentMethod(request.getPaymentMethod());
            order.setTableNumber(request.getTableNumber());
            order.setOrderType("INSTORE");
            order.setShiftId(request.getShiftId());
            order.setCashierId(request.getCashierId());
            order.setStatus("PENDING"); // In-store orders start as PENDING, confirmed later

            Order savedOrder = orderRepository.save(order);

            // Create order items
            if (request.getItems() != null) {
                for (CreateInstoreOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                    OrderItem item = new OrderItem();
                    item.setOrder(savedOrder);
                    item.setProductId(itemRequest.getProductId());
                    item.setQuantity(itemRequest.getQuantity());
                    item.setPriceAtPurchase(itemRequest.getPrice());

                    // Get product name
                    productRepository.findById(itemRequest.getProductId())
                            .ifPresent(product -> item.setProductName(product.getName()));

                    orderItemRepository.save(item);
                }
            }

            // Create status history
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrder(savedOrder);
            history.setStatus("PENDING");
            history.setChangedAt(LocalDateTime.now());
            orderStatusHistoryRepository.save(history);

            // Return full order info for PDF
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getOrderId());
            response.put("orderCode", savedOrder.getOrderCode());
            response.put("orderDate", savedOrder.getOrderDate());
            response.put("tableNumber", savedOrder.getTableNumber());
            response.put("totalAmount", savedOrder.getTotalAmount());
            response.put("paymentMethod", savedOrder.getPaymentMethod());
            response.put("items", orderItemRepository.findByOrderOrderId(savedOrder.getOrderId()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private String generateOrderCode() {
        LocalDate today = LocalDate.now();
        String datePrefix = "DH" + today.format(DateTimeFormatter.ofPattern("yyMMdd"));
        long count = orderRepository.countByOrderCodeStartingWith(datePrefix) + 1;
        return datePrefix + String.format("%03d", count);
    }

    // Inner classes for requests
    public static class CreateInstoreOrderRequest {
        private java.math.BigDecimal totalAmount;
        private String paymentMethod;
        private String tableNumber;
        private Long shiftId;
        private Long cashierId;
        private List<OrderItemRequest> items;

        public java.math.BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(java.math.BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getTableNumber() {
            return tableNumber;
        }

        public void setTableNumber(String tableNumber) {
            this.tableNumber = tableNumber;
        }

        public Long getShiftId() {
            return shiftId;
        }

        public void setShiftId(Long shiftId) {
            this.shiftId = shiftId;
        }

        public Long getCashierId() {
            return cashierId;
        }

        public void setCashierId(Long cashierId) {
            this.cashierId = cashierId;
        }

        public List<OrderItemRequest> getItems() {
            return items;
        }

        public void setItems(List<OrderItemRequest> items) {
            this.items = items;
        }

        public static class OrderItemRequest {
            private Long productId;
            private Integer quantity;
            private java.math.BigDecimal price;
            private String productName;

            public Long getProductId() {
                return productId;
            }

            public void setProductId(Long productId) {
                this.productId = productId;
            }

            public Integer getQuantity() {
                return quantity;
            }

            public void setQuantity(Integer quantity) {
                this.quantity = quantity;
            }

            public java.math.BigDecimal getPrice() {
                return price;
            }

            public void setPrice(java.math.BigDecimal price) {
                this.price = price;
            }

            public String getProductName() {
                return productName;
            }

            public void setProductName(String productName) {
                this.productName = productName;
            }
        }
    }

    // Inner class for create order request
    public static class CreateOrderRequest {
        private Long userId;
        private java.math.BigDecimal totalAmount;
        private String paymentMethod;
        private List<OrderItemRequest> items;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public java.math.BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(java.math.BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public List<OrderItemRequest> getItems() {
            return items;
        }

        public void setItems(List<OrderItemRequest> items) {
            this.items = items;
        }

        public static class OrderItemRequest {
            private Long productId;
            private Integer quantity;
            private java.math.BigDecimal price;

            public Long getProductId() {
                return productId;
            }

            public void setProductId(Long productId) {
                this.productId = productId;
            }

            public Integer getQuantity() {
                return quantity;
            }

            public void setQuantity(Integer quantity) {
                this.quantity = quantity;
            }

            public java.math.BigDecimal getPrice() {
                return price;
            }

            public void setPrice(java.math.BigDecimal price) {
                this.price = price;
            }
        }
    }
}
