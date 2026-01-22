package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Shift;
import vn.edu.hust.final_project.entity.Order;
import vn.edu.hust.final_project.service.ShiftService;
import vn.edu.hust.final_project.repository.OrderRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/start")
    public ResponseEntity<?> startShift(@RequestBody Map<String, Long> request) {
        try {
            Long cashierId = request.get("cashierId");
            Shift savedShift = shiftService.startShift(cashierId);
            return ResponseEntity.ok(savedShift);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/active/{cashierId}")
    public ResponseEntity<?> getActiveShift(@PathVariable Long cashierId) {
        return shiftService.getActiveShift(cashierId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{shiftId}/end")
    public ResponseEntity<?> endShift(@PathVariable Long shiftId) {
        return shiftService.getShiftById(shiftId)
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

                    // End the shift via service
                    Shift updatedShift = shiftService.endShift(shiftId).orElse(shift);

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
        return ResponseEntity.ok(shiftService.getShiftsByCashier(cashierId));
    }

    @GetMapping("/today")
    public ResponseEntity<List<Shift>> getTodayShifts() {
        return ResponseEntity.ok(shiftService.getTodayShifts());
    }
}
