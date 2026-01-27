package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.final_project.entity.Order;
import vn.edu.hust.final_project.entity.OrderItem;
import vn.edu.hust.final_project.entity.OrderStatusHistory;
import vn.edu.hust.final_project.repository.OrderRepository;
import vn.edu.hust.final_project.repository.OrderItemRepository;
import vn.edu.hust.final_project.repository.OrderStatusHistoryRepository;
import vn.edu.hust.final_project.repository.ProductRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Get all orders sorted by date descending
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    /**
     * Get orders by user ID
     */
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    /**
     * Get order by ID with items and status history
     */
    public Optional<Map<String, Object>> getOrderById(Long orderId) {
        return orderRepository.findById(orderId).map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
            for (OrderItem item : items) {
                productRepository.findById(item.getProductId())
                        .ifPresent(product -> item.setProductName(product.getName()));
            }

            List<OrderStatusHistory> statusHistory = orderStatusHistoryRepository
                    .findByOrderOrderIdOrderByChangedAtAsc(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            response.put("items", items);
            response.put("statusHistory", statusHistory);

            return response;
        });
    }

    /**
     * Get order by order code
     */
    public Optional<Order> getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode);
    }

    /**
     * Create online order
     */
    @Transactional
    public Map<String, Object> createOnlineOrder(Long userId, BigDecimal totalAmount, 
            String paymentMethod, List<OrderItemRequest> items) {
        return createOnlineOrder(userId, totalAmount, paymentMethod, items, null);
    }

    /**
     * Create online order with delivery address
     */
    @Transactional
    public Map<String, Object> createOnlineOrder(Long userId, BigDecimal totalAmount, 
            String paymentMethod, List<OrderItemRequest> items, DeliveryInfo delivery) {
        
        String orderCode = generateOrderCode();

        Order order = new Order();
        order.setUserId(userId);
        order.setOrderCode(orderCode);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(paymentMethod);
        order.setStatus("PENDING");
        order.setOrderType("ONLINE");
        order.setEstimatedPickupTime(LocalDateTime.now().plusMinutes(30));

        // Set delivery address if provided
        if (delivery != null) {
            order.setDeliveryAddress(delivery.getAddress());
            order.setDeliveryLatitude(delivery.getLatitude());
            order.setDeliveryLongitude(delivery.getLongitude());
            order.setDeliveryRecipient(delivery.getRecipient());
            order.setDeliveryPhone(delivery.getPhone());
        }

        Order savedOrder = orderRepository.save(order);

        // Create order items
        if (items != null) {
            for (OrderItemRequest itemRequest : items) {
                OrderItem item = new OrderItem();
                item.setOrder(savedOrder);
                item.setProductId(itemRequest.getProductId());
                item.setQuantity(itemRequest.getQuantity());
                item.setPriceAtPurchase(itemRequest.getPrice());
                orderItemRepository.save(item);
            }
        }

        // Create initial status history
        createStatusHistory(savedOrder, "PENDING");

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", savedOrder.getOrderId());
        response.put("orderCode", savedOrder.getOrderCode());
        response.put("message", "Đơn hàng đã được tạo thành công");

        return response;
    }

    /**
     * Create in-store order (POS)
     */
    @Transactional
    public Map<String, Object> createInstoreOrder(BigDecimal totalAmount, String paymentMethod,
            String tableNumber, Long shiftId, Long cashierId, List<OrderItemRequest> items) {
        
        String orderCode = generateOrderCode();

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(paymentMethod);
        order.setTableNumber(tableNumber);
        order.setOrderType("INSTORE");
        order.setShiftId(shiftId);
        order.setCashierId(cashierId);
        order.setStatus("PENDING");

        Order savedOrder = orderRepository.save(order);

        // Create order items
        if (items != null) {
            for (OrderItemRequest itemRequest : items) {
                OrderItem item = new OrderItem();
                item.setOrder(savedOrder);
                item.setProductId(itemRequest.getProductId());
                item.setQuantity(itemRequest.getQuantity());
                item.setPriceAtPurchase(itemRequest.getPrice());

                productRepository.findById(itemRequest.getProductId())
                        .ifPresent(product -> item.setProductName(product.getName()));

                orderItemRepository.save(item);
            }
        }

        // Create status history
        createStatusHistory(savedOrder, "PENDING");

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", savedOrder.getOrderId());
        response.put("orderCode", savedOrder.getOrderCode());
        response.put("orderDate", savedOrder.getOrderDate());
        response.put("tableNumber", savedOrder.getTableNumber());
        response.put("totalAmount", savedOrder.getTotalAmount());
        response.put("paymentMethod", savedOrder.getPaymentMethod());
        response.put("items", orderItemRepository.findByOrderOrderId(savedOrder.getOrderId()));

        return response;
    }

    /**
     * Update order status
     */
    @Transactional
    public Optional<Order> updateOrderStatus(Long orderId, String newStatus) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(newStatus);
            orderRepository.save(order);
            createStatusHistory(order, newStatus);
            return order;
        });
    }

    /**
     * Update order payment
     */
    @Transactional
    public Optional<Order> updateOrderPayment(Long orderId, String paymentMethod, String status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setPaymentMethod(paymentMethod);
            order.setStatus(status);
            orderRepository.save(order);
            createStatusHistory(order, status);
            return order;
        });
    }

    /**
     * Get pending online orders
     */
    public List<Order> getPendingOnlineOrders(String status) {
        List<String> statuses;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            statuses = List.of(status);
        } else {
            statuses = List.of("PENDING", "PREPARING", "READY", "COMPLETED");
        }

        List<Order> orders = orderRepository.findByOrderTypeAndStatusInOrderByOrderDateAsc("ONLINE", statuses);
        populateOrderItems(orders);
        return orders;
    }

    /**
     * Get in-store orders by shift
     */
    public List<Order> getInstoreOrdersByShift(Long shiftId) {
        List<Order> orders = orderRepository.findByOrderTypeAndShiftIdOrderByOrderDateDesc("INSTORE", shiftId);
        populateOrderItems(orders);
        return orders;
    }

    /**
     * Get today's in-store orders (regardless of shift)
     */
    public List<Order> getTodayInstoreOrders() {
        List<Order> orders = orderRepository.findTodayInstoreOrders();
        populateOrderItems(orders);
        return orders;
    }

    /**
     * Search orders with pagination and filters
     */
    public Map<String, Object> searchOrders(int page, int size, String startDate, 
            String endDate, String search, String status) {
        
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT o.*, u.full_name as customer_name, u.phone as customer_phone ");
        sql.append("FROM orders o ");
        sql.append("LEFT JOIN users u ON o.user_id = u.user_id ");
        sql.append("WHERE 1=1 ");

        StringBuilder countSql = new StringBuilder();
        countSql.append("SELECT COUNT(*) FROM orders o WHERE 1=1 ");

        List<Object> params = new ArrayList<>();
        List<Object> countParams = new ArrayList<>();

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

        if (status != null && !status.isEmpty()) {
            sql.append("AND o.status = ? ");
            countSql.append("AND o.status = ? ");
            params.add(status);
            countParams.add(status);
        }

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

        Long totalCount = jdbcTemplate.queryForObject(countSql.toString(), Long.class, countParams.toArray());
        List<Map<String, Object>> orders = jdbcTemplate.queryForList(sql.toString(), params.toArray());

        Map<String, Object> result = new HashMap<>();
        result.put("content", orders);
        result.put("totalElements", totalCount != null ? totalCount : 0);
        result.put("totalPages", (int) Math.ceil((double) (totalCount != null ? totalCount : 0) / size));
        result.put("page", page);
        result.put("size", size);
        result.put("hasNext", (page + 1) * size < (totalCount != null ? totalCount : 0));

        return result;
    }

    // ========== Helper Methods ==========

    private String generateOrderCode() {
        LocalDate today = LocalDate.now();
        String datePrefix = "DH" + today.format(DateTimeFormatter.ofPattern("yyMMdd"));
        long count = orderRepository.countByOrderCodeStartingWith(datePrefix) + 1;
        return datePrefix + String.format("%03d", count);
    }

    private void createStatusHistory(Order order, String status) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setChangedAt(LocalDateTime.now());
        orderStatusHistoryRepository.save(history);
    }

    private void populateOrderItems(List<Order> orders) {
        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
            for (OrderItem item : items) {
                productRepository.findById(item.getProductId())
                        .ifPresent(product -> item.setProductName(product.getName()));
            }
            order.setItems(items);
        }
    }

    // ========== DTO for Order Item Request ==========
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

    // ========== DTO for Delivery Info ==========
    public static class DeliveryInfo {
        private String address;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String recipient;
        private String phone;

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

        public String getRecipient() { return recipient; }
        public void setRecipient(String recipient) { this.recipient = recipient; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}

