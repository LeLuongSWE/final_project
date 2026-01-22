package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.final_project.entity.Shift;
import vn.edu.hust.final_project.repository.ShiftRepository;
import vn.edu.hust.final_project.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Get all shifts
     */
    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    /**
     * Get shift by ID
     */
    public Optional<Shift> getShiftById(Long shiftId) {
        return shiftRepository.findById(shiftId);
    }

    /**
     * Get active shift for a cashier
     */
    public Optional<Shift> getActiveShift(Long cashierId) {
        return shiftRepository.findByCashierIdAndStatus(cashierId, "ACTIVE");
    }

    /**
     * Start a new shift
     */
    @Transactional
    public Shift startShift(Long cashierId) {
        // Check if there's already an active shift
        Optional<Shift> activeShift = getActiveShift(cashierId);
        if (activeShift.isPresent()) {
            throw new RuntimeException("Đã có ca làm việc đang hoạt động");
        }

        Shift shift = new Shift();
        shift.setCashierId(cashierId);
        shift.setStartTime(LocalDateTime.now());
        shift.setStatus("ACTIVE");
        shift.setTotalOrders(0);
        shift.setTotalRevenue(BigDecimal.ZERO);

        return shiftRepository.save(shift);
    }

    /**
     * End a shift
     */
    @Transactional
    public Optional<Shift> endShift(Long shiftId) {
        return shiftRepository.findById(shiftId).map(shift -> {
            shift.setEndTime(LocalDateTime.now());
            shift.setStatus("COMPLETED");
            
            // Calculate total orders and revenue for this shift
            Integer totalOrders = orderRepository.countByShiftId(shiftId);
            BigDecimal revenue = orderRepository.sumTotalAmountByShiftId(shiftId);
            
            shift.setTotalOrders(totalOrders != null ? totalOrders : 0);
            shift.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);
            
            return shiftRepository.save(shift);
        });
    }

    /**
     * Get shifts by cashier
     */
    public List<Shift> getShiftsByCashier(Long cashierId) {
        return shiftRepository.findByCashierIdOrderByStartTimeDesc(cashierId);
    }

    /**
     * Get today's shifts
     */
    public List<Shift> getTodayShifts() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return shiftRepository.findByStartTimeBetweenOrderByStartTimeDesc(startOfDay, endOfDay);
    }

    /**
     * Update shift statistics (can be called when order is completed)
     */
    @Transactional
    public void updateShiftStats(Long shiftId) {
        shiftRepository.findById(shiftId).ifPresent(shift -> {
            Integer totalOrders = orderRepository.countByShiftId(shiftId);
            BigDecimal revenue = orderRepository.sumTotalAmountByShiftId(shiftId);
            
            shift.setTotalOrders(totalOrders != null ? totalOrders : 0);
            shift.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);
            
            shiftRepository.save(shift);
        });
    }
}
