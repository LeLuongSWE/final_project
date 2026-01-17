package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/analytics/sales")
public class SalesAnalyticsController {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        /**
         * 1. Time-series Revenue Analysis
         * GET /api/analytics/sales/time-series?startDate=2026-01-01&endDate=2026-01-31&granularity=day
         */
        @GetMapping("/time-series")
        public List<Map<String, Object>> getTimeSeries(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @RequestParam(defaultValue = "day") String granularity) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_sales_time_series(?, ?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay(),
                        granularity.toLowerCase()
                );
        }

        /**
         * 2. Channel Mix Analysis (ONLINE vs INSTORE)
         * GET /api/analytics/sales/channel-mix?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/channel-mix")
        public List<Map<String, Object>> getChannelMix(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_sales_channel_mix(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
        }

        /**
         * 3. Payment Method Analysis (CASH vs VIETQR)
         * GET /api/analytics/sales/payment-mix?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/payment-mix")
        public List<Map<String, Object>> getPaymentMix(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_sales_payment_mix(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
        }

        /**
         * 4. KPI Summary
         * GET /api/analytics/sales/kpi?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/kpi")
        public Map<String, Object> getKPI(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                List<Map<String, Object>> results = jdbcTemplate.queryForList(
                        "SELECT * FROM fn_sales_kpi(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
                return results.isEmpty() ? new HashMap<>() : results.get(0);
        }

        /**
         * 5. Top Products Analysis
         * GET /api/analytics/sales/top-products?startDate=2026-01-01&endDate=2026-01-31&limit=10
         */
        @GetMapping("/top-products")
        public List<Map<String, Object>> getTopProducts(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @RequestParam(defaultValue = "10") int limit) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_sales_top_products(?, ?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay(),
                        limit
                );
        }

        /**
         * 6. Hourly Distribution (Peak Hours Analysis)
         * GET /api/analytics/sales/hourly-distribution?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/hourly-distribution")
        public List<Map<String, Object>> getHourlyDistribution(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_sales_hourly_distribution(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
        }
}
