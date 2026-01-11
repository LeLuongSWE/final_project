package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Shift;
import vn.edu.hust.final_project.entity.Order;
import vn.edu.hust.final_project.repository.ShiftRepository;
import vn.edu.hust.final_project.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
public class ShiftController {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/start")
    public ResponseEntity<?> startShift(@RequestBody Map<String, Long> request) {
        Long cashierId = request.get("cashierId");
        
        // Check if already has an active shift
        if (shiftRepository.findByCashierIdAndStatus(cashierId, "ACTIVE").isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Nhân viên đã có ca làm việc đang hoạt động");
            return ResponseEntity.badRequest().body(error);
        }

        Shift shift = new Shift();
        shift.setCashierId(cashierId);
        shift.setStatus("ACTIVE");
        Shift savedShift = shiftRepository.save(shift);

        return ResponseEntity.ok(savedShift);
    }

    @GetMapping("/active/{cashierId}")
    public ResponseEntity<?> getActiveShift(@PathVariable Long cashierId) {
        return shiftRepository.findByCashierIdAndStatus(cashierId, "ACTIVE")
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{shiftId}/end")
    public ResponseEntity<?> endShift(@PathVariable Long shiftId) {
        return shiftRepository.findById(shiftId)
                .map(shift -> {
                    // Calculate totals from orders in this shift
                    List<Order> shiftOrders = orderRepository.findByShiftId(shiftId);
                    
                    int totalOrders = shiftOrders.size();
                    BigDecimal totalRevenue = BigDecimal.ZERO;
                    BigDecimal cashRevenue = BigDecimal.ZERO;
                    BigDecimal transferRevenue = BigDecimal.ZERO;

                    for (Order order : shiftOrders) {
                        if ("COMPLETED".equals(order.getStatus())) {
                            totalRevenue = totalRevenue.add(order.getTotalAmount());
                            if ("CASH".equals(order.getPaymentMethod())) {
                                cashRevenue = cashRevenue.add(order.getTotalAmount());
                            } else {
                                transferRevenue = transferRevenue.add(order.getTotalAmount());
                            }
                        }
                    }

                    shift.setEndTime(LocalDateTime.now());
                    shift.setStatus("CLOSED");
                    shift.setTotalOrders(totalOrders);
                    shift.setTotalRevenue(totalRevenue);
                    shift.setCashRevenue(cashRevenue);
                    shift.setTransferRevenue(transferRevenue);

                    Shift updatedShift = shiftRepository.save(shift);

                    Map<String, Object> response = new HashMap<>();
                    response.put("shift", updatedShift);
                    response.put("summary", Map.of(
                        "totalOrders", totalOrders,
                        "totalRevenue", totalRevenue,
                        "cashRevenue", cashRevenue,
                        "transferRevenue", transferRevenue
                    ));

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{cashierId}")
    public ResponseEntity<List<Shift>> getShiftHistory(@PathVariable Long cashierId) {
        List<Shift> shifts = shiftRepository.findByCashierIdOrderByStartTimeDesc(cashierId);
        return ResponseEntity.ok(shifts);
    }
}
