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
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_product_bcg_matrix(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
        }

        /**
         * 2. Market Basket Analysis - Combo Suggestions
         * GET /api/analytics/product/combo-suggestions?limit=10
         */
        @GetMapping("/combo-suggestions")
        public List<Map<String, Object>> getComboSuggestions(
                        @RequestParam(defaultValue = "10") int limit) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_product_combo_suggestions(?)",
                        limit
                );
        }

        /**
         * 3. Period Trend Analysis - So sánh kỳ này vs kỳ trước
         * GET /api/analytics/product/weekly-trend?startDate=&endDate=
         */
        @GetMapping("/weekly-trend")
        public List<Map<String, Object>> getWeeklyTrend(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_product_weekly_trend(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
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
