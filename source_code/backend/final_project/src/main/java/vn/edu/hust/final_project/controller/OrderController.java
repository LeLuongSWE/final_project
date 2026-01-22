package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Order;
import vn.edu.hust.final_project.service.OrderService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(orderService.searchOrders(page, size, startDate, endDate, search, status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<?> getOrderByCode(@PathVariable String orderCode) {
        return orderService.getOrderByCode(orderCode)
                .map(order -> getOrderById(order.getOrderId()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            List<OrderService.OrderItemRequest> items = null;
            if (request.getItems() != null) {
                items = request.getItems().stream()
                        .map(item -> {
                            OrderService.OrderItemRequest serviceItem = new OrderService.OrderItemRequest();
                            serviceItem.setProductId(item.getProductId());
                            serviceItem.setQuantity(item.getQuantity());
                            serviceItem.setPrice(item.getPrice());
                            return serviceItem;
                        })
                        .collect(Collectors.toList());
            }

            Map<String, Object> result = orderService.createOnlineOrder(
                    request.getUserId(),
                    request.getTotalAmount(),
                    request.getPaymentMethod(),
                    items
            );
            return ResponseEntity.ok(result);
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
        return orderService.updateOrderStatus(orderId, newStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/online/pending")
    public ResponseEntity<?> getPendingOnlineOrders(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(orderService.getPendingOnlineOrders(status));
    }

    @GetMapping("/instore/shift/{shiftId}")
    public ResponseEntity<?> getInstoreOrdersByShift(@PathVariable Long shiftId) {
        return ResponseEntity.ok(orderService.getInstoreOrdersByShift(shiftId));
    }

    @PutMapping("/{orderId}/payment")
    public ResponseEntity<?> updateOrderPayment(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String newPaymentMethod = request.get("paymentMethod");
        String newStatus = request.getOrDefault("status", "COMPLETED");
        return orderService.updateOrderPayment(orderId, newPaymentMethod, newStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/instore")
    public ResponseEntity<?> createInstoreOrder(@RequestBody CreateInstoreOrderRequest request) {
        try {
            List<OrderService.OrderItemRequest> items = null;
            if (request.getItems() != null) {
                items = request.getItems().stream()
                        .map(item -> {
                            OrderService.OrderItemRequest serviceItem = new OrderService.OrderItemRequest();
                            serviceItem.setProductId(item.getProductId());
                            serviceItem.setQuantity(item.getQuantity());
                            serviceItem.setPrice(item.getPrice());
                            return serviceItem;
                        })
                        .collect(Collectors.toList());
            }

            Map<String, Object> result = orderService.createInstoreOrder(
                    request.getTotalAmount(),
                    request.getPaymentMethod(),
                    request.getTableNumber(),
                    request.getShiftId(),
                    request.getCashierId(),
                    items
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ========== Inner classes for requests ==========

    public static class CreateInstoreOrderRequest {
        private BigDecimal totalAmount;
        private String paymentMethod;
        private String tableNumber;
        private Long shiftId;
        private Long cashierId;
        private List<OrderItemRequest> items;

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getTableNumber() { return tableNumber; }
        public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
        public Long getShiftId() { return shiftId; }
        public void setShiftId(Long shiftId) { this.shiftId = shiftId; }
        public Long getCashierId() { return cashierId; }
        public void setCashierId(Long cashierId) { this.cashierId = cashierId; }
        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }

        public static class OrderItemRequest {
            private Long productId;
            private Integer quantity;
            private BigDecimal price;
            private String productName;

            public Long getProductId() { return productId; }
            public void setProductId(Long productId) { this.productId = productId; }
            public Integer getQuantity() { return quantity; }
            public void setQuantity(Integer quantity) { this.quantity = quantity; }
            public BigDecimal getPrice() { return price; }
            public void setPrice(BigDecimal price) { this.price = price; }
            public String getProductName() { return productName; }
            public void setProductName(String productName) { this.productName = productName; }
        }
    }

    public static class CreateOrderRequest {
        private Long userId;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private List<OrderItemRequest> items;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }

        public static class OrderItemRequest {
            private Long productId;
            private Integer quantity;
            private BigDecimal price;

            public Long getProductId() { return productId; }
            public void setProductId(Long productId) { this.productId = productId; }
            public Integer getQuantity() { return quantity; }
            public void setQuantity(Integer quantity) { this.quantity = quantity; }
            public BigDecimal getPrice() { return price; }
            public void setPrice(BigDecimal price) { this.price = price; }
        }
    }
}
