package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/analytics/product")
public class ProductAnalyticsController {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        /**
         * 1. BCG Matrix Analysis
         * GET /api/analytics/product/bcg-matrix?startDate=&endDate=
         */
        @GetMapping("/bcg-matrix")
        public List<Map<String, Object>> getBcgMatrix(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "WITH product_metrics AS ( " +
                                "    SELECT  " +
                                "        p.product_id, " +
                                "        p.name, " +
                                "        p.category, " +
                                "        SUM(oi.quantity) as total_quantity, " +
                                "        SUM(oi.quantity * oi.price_at_purchase) as total_revenue " +
                                "    FROM order_items oi " +
                                "    JOIN orders o ON oi.order_id = o.order_id " +
                                "    JOIN products p ON oi.product_id = p.product_id " +
                                "    WHERE o.status = 'COMPLETED'  " +
                                "      AND o.order_date >= ? AND o.order_date < ? " +
                                "    GROUP BY p.product_id, p.name, p.category " +
                                "), " +
                                "averages AS ( " +
                                "    SELECT AVG(total_quantity) as avg_qty, AVG(total_revenue) as avg_rev " +
                                "    FROM product_metrics " +
                                ") " +
                                "SELECT  " +
                                "    pm.product_id, " +
                                "    pm.name, " +
                                "    pm.category, " +
                                "    pm.total_quantity, " +
                                "    pm.total_revenue, " +
                                "    ROUND(a.avg_qty, 2) as avg_quantity, " +
                                "    ROUND(a.avg_rev, 2) as avg_revenue, " +
                                "    CASE  " +
                                "        WHEN pm.total_quantity >= a.avg_qty AND pm.total_revenue >= a.avg_rev  " +
                                "            THEN 'STAR' " +
                                "        WHEN pm.total_quantity < a.avg_qty AND pm.total_revenue >= a.avg_rev  " +
                                "            THEN 'CASH_COW' " +
                                "        WHEN pm.total_quantity >= a.avg_qty AND pm.total_revenue < a.avg_rev  " +
                                "            THEN 'QUESTION' " +
                                "        ELSE 'DOG' " +
                                "    END as bcg_category " +
                                "FROM product_metrics pm, averages a " +
                                "ORDER BY pm.total_revenue DESC";

                return jdbcTemplate.queryForList(sql, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        }

        /**
         * 2. Market Basket Analysis - Combo Suggestions
         * GET /api/analytics/product/combo-suggestions?limit=10
         */
        @GetMapping("/combo-suggestions")
        public List<Map<String, Object>> getComboSuggestions(
                        @RequestParam(defaultValue = "10") int limit) {
                String sql = "SELECT  " +
                                "    p1.name as product_a, " +
                                "    p2.name as product_b, " +
                                "    COUNT(*) as pair_count, " +
                                "    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM orders WHERE status='COMPLETED'), 0), 2) as support_pct "
                                +
                                "FROM order_items oi1 " +
                                "JOIN order_items oi2 ON oi1.order_id = oi2.order_id " +
                                "JOIN products p1 ON oi1.product_id = p1.product_id " +
                                "JOIN products p2 ON oi2.product_id = p2.product_id " +
                                "WHERE oi1.product_id < oi2.product_id " +
                                "GROUP BY p1.name, p2.name " +
                                "ORDER BY pair_count DESC " +
                                "LIMIT ?";

                return jdbcTemplate.queryForList(sql, limit);
        }

        /**
         * 3. Period Trend Analysis - So sánh kỳ này vs kỳ trước
         * GET /api/analytics/product/weekly-trend?startDate=&endDate=
         */
        @GetMapping("/weekly-trend")
        public List<Map<String, Object>> getWeeklyTrend(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

                // Calculate days in current period
                long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;

                // Previous period of equal length
                LocalDate prevEndDate = startDate.minusDays(1);
                LocalDate prevStartDate = prevEndDate.minusDays(daysDiff - 1);

                // Use separate queries for clarity and correct filtering
                String sql = "SELECT  " +
                                "    p.product_id, " +
                                "    p.name, " +
                                "    COALESCE(curr.qty, 0) as this_period, " +
                                "    COALESCE(prev.qty, 0) as last_period, " +
                                "    CASE  " +
                                "        WHEN COALESCE(prev.qty, 0) = 0 AND COALESCE(curr.qty, 0) > 0 THEN 100.0 " +
                                "        WHEN COALESCE(prev.qty, 0) = 0 THEN 0.0 " +
                                "        ELSE ROUND((COALESCE(curr.qty, 0) - prev.qty) * 100.0 / prev.qty, 1) " +
                                "    END as growth_pct, " +
                                "    CASE  " +
                                "        WHEN COALESCE(curr.qty, 0) > COALESCE(prev.qty, 0) THEN 'UP' " +
                                "        WHEN COALESCE(curr.qty, 0) < COALESCE(prev.qty, 0) THEN 'DOWN' " +
                                "        ELSE 'STABLE' " +
                                "    END as trend " +
                                "FROM products p " +
                                "LEFT JOIN ( " +
                                "    SELECT oi.product_id, SUM(oi.quantity) as qty " +
                                "    FROM order_items oi " +
                                "    JOIN orders o ON oi.order_id = o.order_id " +
                                "    WHERE o.status = 'COMPLETED' " +
                                "      AND o.order_date >= ? AND o.order_date < ? " +
                                "    GROUP BY oi.product_id " +
                                ") curr ON p.product_id = curr.product_id " +
                                "LEFT JOIN ( " +
                                "    SELECT oi.product_id, SUM(oi.quantity) as qty " +
                                "    FROM order_items oi " +
                                "    JOIN orders o ON oi.order_id = o.order_id " +
                                "    WHERE o.status = 'COMPLETED' " +
                                "      AND o.order_date >= ? AND o.order_date < ? " +
                                "    GROUP BY oi.product_id " +
                                ") prev ON p.product_id = prev.product_id " +
                                "WHERE COALESCE(curr.qty, 0) > 0 OR COALESCE(prev.qty, 0) > 0 " +
                                "ORDER BY growth_pct DESC";

                return jdbcTemplate.queryForList(sql,
                                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay(),
                                prevStartDate.atStartOfDay(), prevEndDate.plusDays(1).atStartOfDay());
        }

        /**
         * 4. Product KPI Summary
         * GET /api/analytics/product/kpi?startDate=&endDate=
         */
        @GetMapping("/kpi")
        public Map<String, Object> getProductKpi(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                // Get BCG distribution
                List<Map<String, Object>> bcgData = getBcgMatrix(startDate, endDate);

                long starCount = bcgData.stream().filter(m -> "STAR".equals(m.get("bcg_category"))).count();
                long cashCowCount = bcgData.stream().filter(m -> "CASH_COW".equals(m.get("bcg_category"))).count();
                long questionCount = bcgData.stream().filter(m -> "QUESTION".equals(m.get("bcg_category"))).count();
                long dogCount = bcgData.stream().filter(m -> "DOG".equals(m.get("bcg_category"))).count();

                // Best seller
                String bestSeller = bcgData.isEmpty() ? "N/A" : (String) bcgData.get(0).get("name");

                // Get combo count
                List<Map<String, Object>> combos = getComboSuggestions(5);
                int comboSuggestions = combos.size();

                // Get trending products
                List<Map<String, Object>> trends = getWeeklyTrend(startDate, endDate);
                long risingProducts = trends.stream()
                                .filter(m -> "UP".equals(m.get("trend")))
                                .count();
                long fallingProducts = trends.stream()
                                .filter(m -> "DOWN".equals(m.get("trend")))
                                .count();

                Map<String, Object> result = new HashMap<>();
                result.put("total_products", bcgData.size());
                result.put("star_count", starCount);
                result.put("cash_cow_count", cashCowCount);
                result.put("question_count", questionCount);
                result.put("dog_count", dogCount);
                result.put("best_seller", bestSeller);
                result.put("combo_suggestions", comboSuggestions);
                result.put("rising_products", risingProducts);
                result.put("falling_products", fallingProducts);

                return result;
        }
}
