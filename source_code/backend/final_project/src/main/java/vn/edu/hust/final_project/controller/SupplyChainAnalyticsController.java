package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/analytics/supply-chain")
public class SupplyChainAnalyticsController {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        /**
         * 1. Inventory Turnover Analysis
         * GET
         * /api/analytics/supply-chain/turnover?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/turnover")
        public List<Map<String, Object>> getInventoryTurnover(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "SELECT " +
                                "    m.material_id, " +
                                "    m.name, " +
                                "    m.unit, " +
                                "    SUM(CASE WHEN st.type = 'OUT' THEN st.quantity * st.unit_price ELSE 0 END) as cogs, "
                                +
                                "    AVG(m.quantity_in_stock * m.unit_price) as avg_inventory_value, " +
                                "    ROUND( " +
                                "        SUM(CASE WHEN st.type = 'OUT' THEN st.quantity * st.unit_price ELSE 0 END) /  "
                                +
                                "        NULLIF(AVG(m.quantity_in_stock * m.unit_price), 0),  " +
                                "        2 " +
                                "    ) as turnover_ratio " +
                                "FROM materials m " +
                                "LEFT JOIN stock_transactions st ON m.material_id = st.material_id " +
                                "WHERE st.created_at >= ? AND st.created_at < ? " +
                                "GROUP BY m.material_id, m.name, m.unit " +
                                "ORDER BY turnover_ratio DESC NULLS LAST";

                return jdbcTemplate.queryForList(sql, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        }

        /**
         * 2. Purchase Price Variance (PPV)
         * GET /api/analytics/supply-chain/price-variance?materialId=1 (optional)
         */
        @GetMapping("/price-variance")
        public List<Map<String, Object>> getPriceVariance(
                        @RequestParam(required = false) Long materialId) {
                String sql = "WITH price_changes AS ( " +
                                "    SELECT  " +
                                "        material_id, " +
                                "        created_at, " +
                                "        unit_price, " +
                                "        LAG(unit_price) OVER (PARTITION BY material_id ORDER BY created_at) as prev_price, "
                                +
                                "        LAG(created_at) OVER (PARTITION BY material_id ORDER BY created_at) as prev_date "
                                +
                                "    FROM stock_transactions " +
                                "    WHERE type = 'IN' " +
                                (materialId != null ? "      AND material_id = ? " : "") +
                                ") " +
                                "SELECT  " +
                                "    m.material_id, " +
                                "    m.name, " +
                                "    pc.created_at, " +
                                "    pc.unit_price as current_price, " +
                                "    pc.prev_price, " +
                                "    pc.prev_date, " +
                                "    (pc.unit_price - pc.prev_price) as variance, " +
                                "    ROUND(((pc.unit_price - pc.prev_price) / NULLIF(pc.prev_price, 0)) * 100, 2) as variance_pct "
                                +
                                "FROM price_changes pc " +
                                "JOIN materials m ON pc.material_id = m.material_id " +
                                "WHERE pc.prev_price IS NOT NULL " +
                                "ORDER BY pc.created_at DESC " +
                                "LIMIT 50";

                if (materialId != null) {
                        return jdbcTemplate.queryForList(sql, materialId);
                } else {
                        return jdbcTemplate.queryForList(sql);
                }
        }

        /**
         * 3. ABC Analysis
         * GET
         * /api/analytics/supply-chain/abc-analysis?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/abc-analysis")
        public List<Map<String, Object>> getAbcAnalysis(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "WITH material_usage AS ( " +
                                "    SELECT  " +
                                "        m.material_id, " +
                                "        m.name, " +
                                "        SUM(st.quantity * st.unit_price) as total_value, " +
                                "        SUM(st.quantity) as total_quantity " +
                                "    FROM materials m " +
                                "    JOIN stock_transactions st ON m.material_id = st.material_id " +
                                "    WHERE st.type = 'OUT'  " +
                                "      AND st.created_at >= ?  " +
                                "      AND st.created_at < ? " +
                                "    GROUP BY m.material_id, m.name " +
                                "), " +
                                "ranked AS ( " +
                                "    SELECT *, " +
                                "        SUM(total_value) OVER (ORDER BY total_value DESC) as running_total, " +
                                "        SUM(total_value) OVER () as grand_total " +
                                "    FROM material_usage " +
                                ") " +
                                "SELECT  " +
                                "    material_id, " +
                                "    name, " +
                                "    total_value, " +
                                "    total_quantity, " +
                                "    ROUND((running_total / NULLIF(grand_total, 0)) * 100, 2) as cumulative_pct, " +
                                "    CASE  " +
                                "        WHEN (running_total / NULLIF(grand_total, 0)) * 100 <= 80 THEN 'A' " +
                                "        WHEN (running_total / NULLIF(grand_total, 0)) * 100 <= 95 THEN 'B' " +
                                "        ELSE 'C' " +
                                "    END as abc_class " +
                                "FROM ranked " +
                                "ORDER BY total_value DESC";

                return jdbcTemplate.queryForList(sql, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        }

        /**
         * 4. Smart Reorder Point & Alerts
         * GET /api/analytics/supply-chain/reorder-alerts
         */
        @GetMapping("/reorder-alerts")
        public List<Map<String, Object>> getReorderAlerts() {
                String sql = "WITH daily_usage AS ( " +
                                "    SELECT  " +
                                "        material_id, " +
                                "        DATE(created_at) as usage_date, " +
                                "        SUM(quantity) as daily_out " +
                                "    FROM stock_transactions " +
                                "    WHERE type = 'OUT' " +
                                "      AND created_at >= CURRENT_DATE - INTERVAL '30 days' " +
                                "    GROUP BY material_id, DATE(created_at) " +
                                "), " +
                                "avg_usage AS ( " +
                                "    SELECT  " +
                                "        material_id, " +
                                "        AVG(daily_out) as adu, " +
                                "        STDDEV(daily_out) as std_dev " +
                                "    FROM daily_usage " +
                                "    GROUP BY material_id " +
                                ") " +
                                "SELECT  " +
                                "    m.material_id, " +
                                "    m.name, " +
                                "    m.unit, " +
                                "    m.quantity_in_stock, " +
                                "    m.min_stock_level as current_min, " +
                                "    ROUND(COALESCE(au.adu, 0), 2) as avg_daily_usage, " +
                                "    ROUND(COALESCE(au.adu, 0) * 3 + COALESCE(au.adu, 0) * 1.5, 2) as suggested_reorder_point, "
                                +
                                "    CASE  " +
                                "        WHEN au.adu > 0 THEN ROUND(m.quantity_in_stock / au.adu, 1) " +
                                "        ELSE NULL " +
                                "    END as days_until_stockout, " +
                                "    CASE  " +
                                "        WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 3 + COALESCE(au.adu, 0) * 1.5 THEN 'URGENT' "
                                +
                                "        WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 5 THEN 'WARNING' " +
                                "        ELSE 'OK' " +
                                "    END as alert_status " +
                                "FROM materials m " +
                                "LEFT JOIN avg_usage au ON m.material_id = au.material_id " +
                                "ORDER BY  " +
                                "    CASE  " +
                                "        WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 3 + COALESCE(au.adu, 0) * 1.5 THEN 1 "
                                +
                                "        WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 5 THEN 2 " +
                                "        ELSE 3 " +
                                "    END, " +
                                "    CASE WHEN au.adu > 0 THEN ROUND(m.quantity_in_stock / au.adu, 1) ELSE NULL END NULLS LAST";

                return jdbcTemplate.queryForList(sql);
        }

        /**
         * 5. Stock Movement Timeline
         * GET
         * /api/analytics/supply-chain/stock-movement?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/stock-movement")
        public List<Map<String, Object>> getStockMovement(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                String sql = "SELECT " +
                                "    DATE(created_at) as movement_date, " +
                                "    SUM(CASE WHEN type = 'IN' THEN quantity * unit_price ELSE 0 END) as total_in_value, "
                                +
                                "    SUM(CASE WHEN type = 'OUT' THEN quantity * unit_price ELSE 0 END) as total_out_value, "
                                +
                                "    SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) as total_in_quantity, " +
                                "    SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) as total_out_quantity, " +
                                "    COUNT(CASE WHEN type = 'IN' THEN 1 END) as in_transactions, " +
                                "    COUNT(CASE WHEN type = 'OUT' THEN 1 END) as out_transactions " +
                                "FROM stock_transactions " +
                                "WHERE created_at >= ? AND created_at < ? " +
                                "GROUP BY DATE(created_at) " +
                                "ORDER BY movement_date";

                return jdbcTemplate.queryForList(sql, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        }

        /**
         * 6. KPI Summary
         * GET /api/analytics/supply-chain/kpi?startDate=2026-01-01&endDate=2026-01-31
         */
        @GetMapping("/kpi")
        public Map<String, Object> getKPI(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                // Overall inventory value
                String valueSql = "SELECT SUM(quantity_in_stock * unit_price) as total_inventory_value FROM materials";
                Map<String, Object> valueResult = jdbcTemplate.queryForMap(valueSql);

                // Count alerts
                String alertSql = "SELECT " +
                                "    COUNT(CASE WHEN quantity_in_stock <= min_stock_level THEN 1 END) as urgent_alerts, "
                                +
                                "    COUNT(*) as total_materials " +
                                "FROM materials";
                Map<String, Object> alertResult = jdbcTemplate.queryForMap(alertSql);

                // ABC distribution
                List<Map<String, Object>> abcData = getAbcAnalysis(startDate, endDate);
                long classACount = abcData.stream().filter(m -> "A".equals(m.get("abc_class"))).count();
                long classBCount = abcData.stream().filter(m -> "B".equals(m.get("abc_class"))).count();
                long classCCount = abcData.stream().filter(m -> "C".equals(m.get("abc_class"))).count();

                // Average turnover
                List<Map<String, Object>> turnoverData = getInventoryTurnover(startDate, endDate);
                double avgTurnover = turnoverData.stream()
                                .map(m -> m.get("turnover_ratio"))
                                .filter(Objects::nonNull)
                                .mapToDouble(o -> ((Number) o).doubleValue())
                                .average()
                                .orElse(0.0);

                Map<String, Object> result = new HashMap<>();
                result.put("total_inventory_value", valueResult.get("total_inventory_value"));
                result.put("urgent_alerts", alertResult.get("urgent_alerts"));
                result.put("total_materials", alertResult.get("total_materials"));
                result.put("abc_class_a_count", classACount);
                result.put("abc_class_b_count", classBCount);
                result.put("abc_class_c_count", classCCount);
                result.put("avg_turnover_ratio", Math.round(avgTurnover * 100.0) / 100.0);

                return result;
        }
}
