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
        String sql = "WITH status_timestamps AS ( " +
                "    SELECT  " +
                "        osh.order_id, " +
                "        MAX(CASE WHEN osh.status = 'PENDING' THEN osh.changed_at END) as t_pending, " +
                "        MAX(CASE WHEN osh.status = 'PREPARING' THEN osh.changed_at END) as t_preparing, " +
                "        MAX(CASE WHEN osh.status = 'READY' THEN osh.changed_at END) as t_ready, " +
                "        MAX(CASE WHEN osh.status = 'COMPLETED' THEN osh.changed_at END) as t_completed " +
                "    FROM order_status_history osh " +
                "    JOIN orders o ON osh.order_id = o.order_id " +
                "    WHERE o.order_date >= ? AND o.order_date < ? " +
                "    GROUP BY osh.order_id " +
                ") " +
                "SELECT  " +
                "    ROUND(AVG(EXTRACT(EPOCH FROM (t_preparing - t_pending))/60)::numeric, 2) as avg_confirm_min, " +
                "    ROUND(AVG(EXTRACT(EPOCH FROM (t_ready - t_preparing))/60)::numeric, 2) as avg_cooking_min, " +
                "    ROUND(AVG(EXTRACT(EPOCH FROM (t_completed - t_ready))/60)::numeric, 2) as avg_pickup_min, " +
                "    ROUND(AVG(EXTRACT(EPOCH FROM (t_completed - t_pending))/60)::numeric, 2) as avg_total_min, " +
                "    COUNT(*) as total_orders " +
                "FROM status_timestamps " +
                "WHERE t_pending IS NOT NULL AND t_completed IS NOT NULL";

        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql,
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        return results.isEmpty() ? new HashMap<>() : results.get(0);
    }

    /**
     * 2. Staff Performance Ranking - Xếp hạng nhân viên (with date filter)
     * GET /api/analytics/workforce/staff-ranking?startDate=&endDate=
     */
    @GetMapping("/staff-ranking")
    public List<Map<String, Object>> getStaffRanking(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String sql = "SELECT  " +
                "    u.user_id, " +
                "    u.full_name, " +
                "    COUNT(s.shift_id) as total_shifts, " +
                "    COALESCE(SUM(s.total_orders), 0) as total_orders, " +
                "    COALESCE(SUM(s.total_revenue), 0) as total_revenue, " +
                "    ROUND(COALESCE(SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600), 0)::numeric, 1) as total_hours, "
                +
                "    CASE " +
                "        WHEN SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) > 0 " +
                "        THEN ROUND((SUM(s.total_revenue) / SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600))::numeric, 0) "
                +
                "        ELSE 0 " +
                "    END as revenue_per_hour, " +
                "    DENSE_RANK() OVER ( " +
                "        ORDER BY CASE " +
                "            WHEN SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) > 0 " +
                "            THEN SUM(s.total_revenue) / SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) " +
                "            ELSE 0 " +
                "        END DESC " +
                "    ) as rank " +
                "FROM shifts s " +
                "JOIN users u ON s.cashier_id = u.user_id " +
                "WHERE s.status = 'CLOSED' AND s.end_time IS NOT NULL " +
                "  AND s.start_time >= ? AND s.start_time < ? " +
                "GROUP BY u.user_id, u.full_name " +
                "ORDER BY rank";

        return jdbcTemplate.queryForList(sql,
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
    }

    /**
     * 3. Shift Reconciliation - Đối soát ca (with date filter)
     * GET /api/analytics/workforce/reconciliation?startDate=&endDate=
     */
    @GetMapping("/reconciliation")
    public List<Map<String, Object>> getReconciliation(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String sql = "WITH system_cash AS ( " +
                "    SELECT shift_id, COALESCE(SUM(total_amount), 0) as calc_cash " +
                "    FROM orders " +
                "    WHERE payment_method = 'CASH' AND status = 'COMPLETED' " +
                "    GROUP BY shift_id " +
                ") " +
                "SELECT  " +
                "    s.shift_id, " +
                "    u.full_name, " +
                "    s.start_time, " +
                "    s.end_time, " +
                "    s.total_orders, " +
                "    s.total_revenue, " +
                "    COALESCE(sc.calc_cash, 0) as system_cash, " +
                "    s.cash_revenue as declared_cash, " +
                "    (s.cash_revenue - COALESCE(sc.calc_cash, 0)) as variance, " +
                "    CASE  " +
                "        WHEN ABS(s.cash_revenue - COALESCE(sc.calc_cash, 0)) > 50000 THEN 'CRITICAL' " +
                "        WHEN ABS(s.cash_revenue - COALESCE(sc.calc_cash, 0)) > 10000 THEN 'WARNING' " +
                "        ELSE 'OK' " +
                "    END as status " +
                "FROM shifts s " +
                "JOIN users u ON s.cashier_id = u.user_id " +
                "LEFT JOIN system_cash sc ON s.shift_id = sc.shift_id " +
                "WHERE s.status = 'CLOSED' " +
                "  AND s.start_time >= ? AND s.start_time < ? " +
                "ORDER BY s.start_time DESC ";

        return jdbcTemplate.queryForList(sql,
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
    }

    /**
     * 4. Hourly Heatmap - Biểu đồ nhiệt theo giờ (with date filter)
     * GET /api/analytics/workforce/hourly-heatmap?startDate=&endDate=
     */
    @GetMapping("/hourly-heatmap")
    public List<Map<String, Object>> getHourlyHeatmap(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String sql = "SELECT  " +
                "    EXTRACT(DOW FROM order_date)::int as day_of_week, " +
                "    EXTRACT(HOUR FROM order_date)::int as hour, " +
                "    COUNT(*) as order_count, " +
                "    COALESCE(SUM(total_amount), 0) as revenue " +
                "FROM orders " +
                "WHERE status = 'COMPLETED' " +
                "  AND order_date >= ? AND order_date < ? " +
                "GROUP BY day_of_week, hour " +
                "ORDER BY day_of_week, hour";

        return jdbcTemplate.queryForList(sql,
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
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

        // Get top performer (for this period)
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
