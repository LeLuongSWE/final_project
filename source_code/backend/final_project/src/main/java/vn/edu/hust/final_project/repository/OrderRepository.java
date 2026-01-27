package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.Order;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    Optional<Order> findByOrderCode(String orderCode);
    long countByOrderCodeStartingWith(String prefix);
    
    // For shift management
    List<Order> findByShiftId(Long shiftId);
    
    // For online orders management
    List<Order> findByOrderTypeAndStatusInOrderByOrderDateAsc(String orderType, List<String> statuses);
    
    // For in-store orders
    List<Order> findByOrderTypeAndShiftIdOrderByOrderDateDesc(String orderType, Long shiftId);
    
    // For admin - get all orders
    List<Order> findAllByOrderByOrderDateDesc();
    
    // For shift statistics
    Integer countByShiftId(Long shiftId);
    
    // Today's in-store orders (for staff view)
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.orderType = 'INSTORE' AND o.orderDate >= CURRENT_DATE ORDER BY o.orderDate DESC")
    List<Order> findTodayInstoreOrders();
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.shiftId = :shiftId AND o.status = 'COMPLETED'")
    java.math.BigDecimal sumTotalAmountByShiftId(@org.springframework.data.repository.query.Param("shiftId") Long shiftId);
}
