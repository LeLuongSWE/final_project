package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/analytics/sales")
public class SalesAnalyticsController {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        /**
         * 1. Time-series Revenue Analysis
         * GET
         * /api/analytics/sales/time-series?startDate=2026-01-01&endDate=2026-01-31&granularity=day
         */
        @GetMapping("/time-series")
        public List<Map<String, Object>> getTimeSeries(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @RequestParam(defaultValue = "day") String granularity) {
                String truncFunction;
                switch (granularity.toLowerCase()) {
                        case "hour":
                                truncFunction = "hour";
                                break;
                        case "week":
                                truncFunction = "week";
                                break;
                        case "month":
                                truncFunction = "month";
                                break;
                        default:
                                truncFunction = "day";
                }

                String sql = "SELECT " +
                                "    DATE_TRUNC(?, order_date) AS time_bucket, " +
                                "    COUNT(order_id) AS total_orders, " +
                                "    SUM(total_amount) AS total_revenue, " +
                                "    AVG(total_amount) AS avg_order_value " +
                                "FROM orders " +
                                "WHERE status = 'COMPLETED' " +
                                "  AND order_date >= ? " +
                                "  AND order_date < ? " +
                                "GROUP BY 1 " +
                                "ORDER BY 1";

                return jdbcTemplate.queryForList(sql,
                                truncFunction,
                                startDate.atStartOfDay(),
                                endDate.plusDays(1).atStartOfDay());
        }

        /**
         * 2. Channel Mix Analysis (ONLINE vs INSTORE)
         * GET /api/analytics/sales/channel-mix?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/channel-mix")
        public List<Map<String, Object>> getChannelMix(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "SELECT " +
                                "    order_type, " +
                                "    COUNT(order_id) AS transaction_count, " +
                                "    SUM(total_amount) AS revenue_volume, " +
                                "    ROUND((SUM(total_amount) * 100.0 / SUM(SUM(total_amount)) OVER ()), 2) AS percentage "
                                +
                                "FROM orders " +
                                "WHERE status = 'COMPLETED' " +
                                "  AND order_date >= ? " +
                                "  AND order_date < ? " +
                                "GROUP BY order_type";

                return jdbcTemplate.queryForList(sql,
                                startDate.atStartOfDay(),
                                endDate.plusDays(1).atStartOfDay());
        }

        /**
         * 3. Payment Method Analysis (CASH vs VIETQR)
         * GET /api/analytics/sales/payment-mix?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/payment-mix")
        public List<Map<String, Object>> getPaymentMix(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "SELECT " +
                                "    payment_method, " +
                                "    COUNT(order_id) AS transaction_count, " +
                                "    SUM(total_amount) AS revenue_volume, " +
                                "    ROUND((SUM(total_amount) * 100.0 / SUM(SUM(total_amount)) OVER ()), 2) AS percentage "
                                +
                                "FROM orders " +
                                "WHERE status = 'COMPLETED' " +
                                "  AND order_date >= ? " +
                                "  AND order_date < ? " +
                                "GROUP BY payment_method";

                return jdbcTemplate.queryForList(sql,
                                startDate.atStartOfDay(),
                                endDate.plusDays(1).atStartOfDay());
        }

        /**
         * 4. KPI Summary
         * GET /api/analytics/sales/kpi?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/kpi")
        public Map<String, Object> getKPI(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "SELECT " +
                                "    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_orders, " +
                                "    COUNT(*) AS total_orders, " +
                                "    ROUND(COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS completion_rate, "
                                +
                                "    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) AS total_revenue, "
                                +
                                "    COALESCE(AVG(CASE WHEN status = 'COMPLETED' THEN total_amount END), 0) AS avg_order_value, "
                                +
                                "    COUNT(DISTINCT user_id) AS unique_customers " +
                                "FROM orders " +
                                "WHERE order_date >= ? " +
                                "  AND order_date < ?";

                Map<String, Object> result = jdbcTemplate.queryForMap(sql,
                                startDate.atStartOfDay(),
                                endDate.plusDays(1).atStartOfDay());

                // Calculate growth (compare with previous period)
                long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
                LocalDate prevStartDate = startDate.minusDays(daysDiff);
                LocalDate prevEndDate = startDate;

                String prevSql = "SELECT COALESCE(SUM(total_amount), 0) AS prev_revenue " +
                                "FROM orders " +
                                "WHERE status = 'COMPLETED' " +
                                "  AND order_date >= ? " +
                                "  AND order_date < ?";

                Map<String, Object> prevResult = jdbcTemplate.queryForMap(prevSql,
                                prevStartDate.atStartOfDay(),
                                prevEndDate.atStartOfDay());

                Number currentRevenue = (Number) result.get("total_revenue");
                Number previousRevenue = (Number) prevResult.get("prev_revenue");

                double growthRate = 0.0;
                if (previousRevenue.doubleValue() > 0) {
                        growthRate = ((currentRevenue.doubleValue() - previousRevenue.doubleValue()) /
                                        previousRevenue.doubleValue()) * 100;
                }

                result.put("growth_rate", Math.round(growthRate * 100.0) / 100.0);
                result.put("previous_revenue", previousRevenue);

                // Calculate COGS (Cost of Goods Sold) from stock transactions
                String cogsSql = "SELECT COALESCE(SUM(quantity * unit_price), 0) AS cogs " +
                                "FROM stock_transactions " +
                                "WHERE type = 'OUT' " +
                                "  AND created_at >= ? " +
                                "  AND created_at < ?";

                Map<String, Object> cogsResult = jdbcTemplate.queryForMap(cogsSql,
                                startDate.atStartOfDay(),
                                endDate.plusDays(1).atStartOfDay());

                Number cogs = (Number) cogsResult.get("cogs");
                double grossProfit = currentRevenue.doubleValue() - cogs.doubleValue();
                double grossMargin = 0.0;
                if (currentRevenue.doubleValue() > 0) {
                        grossMargin = (grossProfit / currentRevenue.doubleValue()) * 100;
                }

                result.put("cogs", cogs);
                result.put("gross_profit", Math.round(grossProfit));
                result.put("gross_margin_pct", Math.round(grossMargin * 100.0) / 100.0);

                return result;
        }

        /**
         * 5. Top Products Analysis
         * GET
         * /api/analytics/sales/top-products?startDate=2026-01-01&endDate=2026-01-31&limit=10
         */
        @GetMapping("/top-products")
        public List<Map<String, Object>> getTopProducts(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @RequestParam(defaultValue = "10") int limit) {
                String sql = "SELECT " +
                                "    p.product_id, " +
                                "    p.name AS product_name, " +
                                "    p.category, " +
                                "    SUM(oi.quantity) AS total_quantity, " +
                                "    SUM(oi.quantity * oi.price_at_purchase) AS total_revenue, " +
                                "    COUNT(DISTINCT oi.order_id) AS order_count " +
                                "FROM order_items oi " +
                                "JOIN products p ON oi.product_id = p.product_id " +
                                "JOIN orders o ON oi.order_id = o.order_id " +
                                "WHERE o.status = 'COMPLETED' " +
                                "  AND o.order_date >= ? " +
                                "  AND o.order_date < ? " +
                                "GROUP BY p.product_id, p.name, p.category " +
                                "ORDER BY total_revenue DESC " +
                                "LIMIT ?";

                return jdbcTemplate.queryForList(sql,
                                startDate.atStartOfDay(),
                                endDate.plusDays(1).atStartOfDay(),
                                limit);
        }

        /**
         * 6. Hourly Distribution (Peak Hours Analysis)
         * GET
         * /api/analytics/sales/hourly-distribution?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/hourly-distribution")
        public List<Map<String, Object>> getHourlyDistribution(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "SELECT " +
                                "    EXTRACT(HOUR FROM order_date) AS hour_of_day, " +
                                "    COUNT(order_id) AS order_count, " +
                                "    SUM(total_amount) AS revenue " +
                                "FROM orders " +
                                "WHERE status = 'COMPLETED' " +
                                "  AND order_date >= ? " +
                                "  AND order_date < ? " +
                                "GROUP BY EXTRACT(HOUR FROM order_date) " +
                                "ORDER BY hour_of_day";

                return jdbcTemplate.queryForList(sql,
                                startDate.atStartOfDay(),
                                endDate.plusDays(1).atStartOfDay());
        }
}
