package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/analytics/workforce")
public class WorkforceAnalyticsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 1. Process Time Analysis - Thời gian xử lý đơn
     * GET /api/analytics/workforce/process-time?startDate=&endDate=
     */
    @GetMapping("/process-time")
    public Map<String, Object> getProcessTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Map<String, Object>> results = jdbcTemplate.queryForList(
                "SELECT * FROM fn_workforce_process_time(?, ?)",
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay()
        );
        return results.isEmpty() ? new HashMap<>() : results.get(0);
    }

    /**
     * 2. Staff Performance Ranking - Xếp hạng nhân viên
     * GET /api/analytics/workforce/staff-ranking?startDate=&endDate=
     */
    @GetMapping("/staff-ranking")
    public List<Map<String, Object>> getStaffRanking(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return jdbcTemplate.queryForList(
                "SELECT * FROM fn_workforce_staff_ranking(?, ?)",
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay()
        );
    }

    /**
     * 3. Shift Reconciliation - Đối soát ca
     * GET /api/analytics/workforce/reconciliation?startDate=&endDate=
     */
    @GetMapping("/reconciliation")
    public List<Map<String, Object>> getReconciliation(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return jdbcTemplate.queryForList(
                "SELECT * FROM fn_workforce_reconciliation(?, ?)",
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay()
        );
    }

    /**
     * 4. Hourly Heatmap - Biểu đồ nhiệt theo giờ
     * GET /api/analytics/workforce/hourly-heatmap?startDate=&endDate=
     */
    @GetMapping("/hourly-heatmap")
    public List<Map<String, Object>> getHourlyHeatmap(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return jdbcTemplate.queryForList(
                "SELECT * FROM fn_workforce_hourly_heatmap(?, ?)",
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay()
        );
    }

    /**
     * 5. Workforce KPI Summary
     * GET /api/analytics/workforce/kpi?startDate=&endDate=
     */
    @GetMapping("/kpi")
    public Map<String, Object> getWorkforceKpi(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        // Get process time
        Map<String, Object> processTime = getProcessTime(startDate, endDate);
        result.put("avg_process_time", processTime.getOrDefault("avg_total_min", 0));

        // Get top performer
        List<Map<String, Object>> staffRanking = getStaffRanking(startDate, endDate);
        if (!staffRanking.isEmpty()) {
            result.put("top_performer", staffRanking.get(0).get("full_name"));
            result.put("top_revenue_per_hour", staffRanking.get(0).get("revenue_per_hour"));
        } else {
            result.put("top_performer", "N/A");
            result.put("top_revenue_per_hour", 0);
        }

        // Count total closed shifts in period
        String shiftCountSql = "SELECT COUNT(*) FROM shifts WHERE status = 'CLOSED' " +
                "AND start_time >= ? AND start_time < ?";
        Integer totalShifts = jdbcTemplate.queryForObject(shiftCountSql, Integer.class,
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        result.put("total_closed_shifts", totalShifts != null ? totalShifts : 0);

        // Count reconciliation issues in period
        List<Map<String, Object>> reconciliation = getReconciliation(startDate, endDate);
        long issueCount = reconciliation.stream()
                .filter(r -> !"OK".equals(r.get("status")))
                .count();
        result.put("reconciliation_issues", issueCount);

        // Get peak hour for period
        List<Map<String, Object>> heatmap = getHourlyHeatmap(startDate, endDate);
        Optional<Map<String, Object>> peakHour = heatmap.stream()
                .max(Comparator.comparing(m -> ((Number) m.get("order_count")).longValue()));
        if (peakHour.isPresent()) {
            result.put("peak_hour", peakHour.get().get("hour"));
            result.put("peak_orders", peakHour.get().get("order_count"));
        } else {
            result.put("peak_hour", 12);
            result.put("peak_orders", 0);
        }

        // Count active staff in period
        String staffCountSql = "SELECT COUNT(DISTINCT cashier_id) FROM shifts " +
                "WHERE status = 'CLOSED' AND start_time >= ? AND start_time < ?";
        Integer activeStaff = jdbcTemplate.queryForObject(staffCountSql, Integer.class,
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        result.put("active_staff_count", activeStaff != null ? activeStaff : 0);

        return result;
    }
}
