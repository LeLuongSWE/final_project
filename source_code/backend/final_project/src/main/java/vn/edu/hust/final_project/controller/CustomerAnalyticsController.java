package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/analytics/customers")
@CrossOrigin(origins = "*")
public class CustomerAnalyticsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 1. Customer Distribution by Ward (Phường/Xã)
     * GET /api/analytics/customers/by-ward?startDate=2026-01-01&endDate=2026-01-31
     */
    @GetMapping("/by-ward")
    public List<Map<String, Object>> getByWard(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return jdbcTemplate.queryForList(
            "SELECT * FROM fn_customer_by_ward(?, ?)",
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay()
        );
    }

    /**
     * 2. Customer Segmentation by Order Frequency
     * GET /api/analytics/customers/by-frequency?startDate=2026-01-01&endDate=2026-01-31
     */
    @GetMapping("/by-frequency")
    public List<Map<String, Object>> getByFrequency(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return jdbcTemplate.queryForList(
            "SELECT * FROM fn_customer_by_frequency(?, ?)",
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay()
        );
    }

    /**
     * 3. Customer Segmentation by Average Order Value
     * GET /api/analytics/customers/by-order-value?startDate=2026-01-01&endDate=2026-01-31
     */
    @GetMapping("/by-order-value")
    public List<Map<String, Object>> getByOrderValue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return jdbcTemplate.queryForList(
            "SELECT * FROM fn_customer_by_order_value(?, ?)",
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay()
        );
    }

    /**
     * 4. Customer KPI Summary
     * GET /api/analytics/customers/kpi?startDate=2026-01-01&endDate=2026-01-31
     */
    @GetMapping("/kpi")
    public Map<String, Object> getCustomerKPI(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> kpi = new HashMap<>();
        
        // Total unique customers
        Long totalCustomers = jdbcTemplate.queryForObject(
            "SELECT COUNT(DISTINCT user_id) FROM orders WHERE order_date >= ? AND order_date < ? AND status = 'COMPLETED' AND user_id IS NOT NULL",
            Long.class,
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay()
        );
        kpi.put("totalCustomers", totalCustomers != null ? totalCustomers : 0);

        // New customers (first order in period)
        Long newCustomers = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM (SELECT user_id FROM orders WHERE order_date >= ? AND order_date < ? AND status = 'COMPLETED' AND user_id IS NOT NULL GROUP BY user_id HAVING MIN(order_date) >= ?) AS new_custs",
            Long.class,
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay(),
            startDate.atStartOfDay()
        );
        kpi.put("newCustomers", newCustomers != null ? newCustomers : 0);

        // Returning customers
        Long returningCustomers = jdbcTemplate.queryForObject(
            "SELECT COUNT(DISTINCT user_id) FROM orders WHERE order_date >= ? AND order_date < ? AND status = 'COMPLETED' AND user_id IS NOT NULL AND user_id IN (SELECT user_id FROM orders WHERE order_date < ? AND status = 'COMPLETED')",
            Long.class,
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay(),
            startDate.atStartOfDay()
        );
        kpi.put("returningCustomers", returningCustomers != null ? returningCustomers : 0);

        // Average orders per customer
        Double avgOrdersPerCustomer = jdbcTemplate.queryForObject(
            "SELECT AVG(order_count) FROM (SELECT user_id, COUNT(*) as order_count FROM orders WHERE order_date >= ? AND order_date < ? AND status = 'COMPLETED' AND user_id IS NOT NULL GROUP BY user_id) AS user_orders",
            Double.class,
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay()
        );
        kpi.put("avgOrdersPerCustomer", avgOrdersPerCustomer != null ? Math.round(avgOrdersPerCustomer * 10) / 10.0 : 0);

        // Customer with addresses (for delivery analysis)
        Long customersWithAddress = jdbcTemplate.queryForObject(
            "SELECT COUNT(DISTINCT user_id) FROM orders WHERE order_date >= ? AND order_date < ? AND status = 'COMPLETED' AND delivery_address IS NOT NULL",
            Long.class,
            startDate.atStartOfDay(),
            endDate.plusDays(1).atStartOfDay()
        );
        kpi.put("customersWithAddress", customersWithAddress != null ? customersWithAddress : 0);

        return kpi;
    }
}
