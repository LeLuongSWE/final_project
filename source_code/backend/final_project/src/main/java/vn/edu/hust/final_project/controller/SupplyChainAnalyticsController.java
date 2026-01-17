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
         * Helper: Tính giá trị tồn kho tại một thời điểm
         */
        private Number getInventoryValueAtDate(LocalDate date) {
                Number result = jdbcTemplate.queryForObject(
                        "SELECT fn_supply_inventory_value_at_date(?)",
                        Number.class,
                        date.atStartOfDay()
                );
                return result != null ? result : 0;
        }

        /**
         * 1. Inventory Turnover Analysis
         * GET /api/analytics/supply-chain/turnover?startDate=&endDate=
         */
        @GetMapping("/turnover")
        public List<Map<String, Object>> getInventoryTurnover(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_supply_turnover(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
        }

        /**
         * 2. Purchase Price Variance (PPV) - Biến động Giá nhập
         * GET /api/analytics/supply-chain/price-variance?materialId=
         */
        @GetMapping("/price-variance")
        public List<Map<String, Object>> getPriceVariance(
                        @RequestParam(required = false) Long materialId) {
                String sql = "WITH price_changes AS ( " +
                                "    SELECT  " +
                                "        material_id, " +
                                "        created_at, " +
                                "        unit_price, " +
                                "        quantity, " +
                                "        LAG(unit_price) OVER (PARTITION BY material_id ORDER BY created_at) as prev_price, " +
                                "        LAG(created_at) OVER (PARTITION BY material_id ORDER BY created_at) as prev_date " +
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
                                "    pc.quantity, " +
                                "    (pc.unit_price - pc.prev_price) as variance, " +
                                "    ROUND(((pc.unit_price - pc.prev_price) / NULLIF(pc.prev_price, 0)) * 100, 2) as variance_pct " +
                                "FROM price_changes pc " +
                                "JOIN materials m ON pc.material_id = m.material_id " +
                                "WHERE pc.prev_price IS NOT NULL " +
                                "ORDER BY ABS(pc.unit_price - pc.prev_price) DESC, pc.created_at DESC " +
                                "LIMIT 50";

                if (materialId != null) {
                        return jdbcTemplate.queryForList(sql, materialId);
                } else {
                        return jdbcTemplate.queryForList(sql);
                }
        }

        /**
         * 3. ABC Analysis - Phân loại nguyên liệu theo giá trị tiêu thụ
         * GET /api/analytics/supply-chain/abc-analysis?startDate=&endDate=
         */
        @GetMapping("/abc-analysis")
        public List<Map<String, Object>> getAbcAnalysis(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_supply_abc_analysis(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
        }

        /**
         * 4. Smart Reorder Point & Alerts
         * GET /api/analytics/supply-chain/reorder-alerts
         */
        @GetMapping("/reorder-alerts")
        public List<Map<String, Object>> getReorderAlerts() {
                return jdbcTemplate.queryForList("SELECT * FROM fn_supply_reorder_alerts()");
        }

        /**
         * 5. Stock Movement Timeline
         * GET /api/analytics/supply-chain/stock-movement?startDate=&endDate=
         */
        @GetMapping("/stock-movement")
        public List<Map<String, Object>> getStockMovement(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                return jdbcTemplate.queryForList(
                        "SELECT * FROM fn_supply_stock_movement(?, ?)",
                        startDate.atStartOfDay(),
                        endDate.plusDays(1).atStartOfDay()
                );
        }

        /**
         * 6. KPI Summary - Tổng hợp các chỉ số KPI
         * GET /api/analytics/supply-chain/kpi?startDate=&endDate=
         */
        @GetMapping("/kpi")
        public Map<String, Object> getKPI(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                
                // 1. Tồn kho đầu kỳ
                Number startValue = getInventoryValueAtDate(startDate);

                // 2. Tồn kho cuối kỳ
                Number endValue = getInventoryValueAtDate(endDate.plusDays(1));

                // 3. Tồn kho bình quân
                double avgInventory = (startValue.doubleValue() + endValue.doubleValue()) / 2.0;

                // 4. Tổng nhập kho trong kỳ
                String inSql = "SELECT COALESCE(SUM(quantity * unit_price), 0) as total_in_value " +
                        "FROM stock_transactions " +
                        "WHERE type = 'IN' AND created_at >= ? AND created_at < ?";
                Map<String, Object> inData = jdbcTemplate.queryForMap(inSql, 
                        startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

                // 5. Tổng xuất kho trong kỳ (COGS)
                String outSql = "SELECT COALESCE(SUM(quantity * unit_price), 0) as cogs " +
                        "FROM stock_transactions " +
                        "WHERE type = 'OUT' AND created_at >= ? AND created_at < ?";
                Map<String, Object> outData = jdbcTemplate.queryForMap(outSql, 
                        startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

                // 6. Vòng quay tồn kho
                Number cogsValue = (Number) outData.get("cogs");
                double turnoverRatio = avgInventory > 0 ? cogsValue.doubleValue() / avgInventory : 0;

                // 7. Số ngày tồn kho
                long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
                double daysOnHand = turnoverRatio > 0 ? daysBetween / turnoverRatio : 0;

                // 8. Count materials and alerts
                String alertSql = "SELECT " +
                                "    COUNT(*) as total_materials, " +
                                "    COUNT(CASE WHEN quantity_in_stock <= min_stock_level THEN 1 END) as urgent_alerts, " +
                                "    COUNT(CASE WHEN quantity_in_stock <= 0 THEN 1 END) as out_of_stock " +
                                "FROM materials";
                Map<String, Object> alertResult = jdbcTemplate.queryForMap(alertSql);

                // 9. ABC Analysis counts
                List<Map<String, Object>> abcData = getAbcAnalysis(startDate, endDate);
                long classACount = abcData.stream().filter(m -> "A".equals(m.get("abc_class"))).count();
                long classBCount = abcData.stream().filter(m -> "B".equals(m.get("abc_class"))).count();
                long classCCount = abcData.stream().filter(m -> "C".equals(m.get("abc_class"))).count();

                // Build result
                Map<String, Object> result = new LinkedHashMap<>();
                result.put("start_inventory_value", Math.round(startValue.doubleValue()));
                result.put("end_inventory_value", Math.round(endValue.doubleValue()));
                result.put("avg_inventory_value", Math.round(avgInventory));
                result.put("total_in_value", inData.get("total_in_value"));
                result.put("total_out_value", outData.get("cogs"));
                result.put("cogs", outData.get("cogs"));
                result.put("turnover_ratio", Math.round(turnoverRatio * 100.0) / 100.0);
                result.put("days_on_hand", Math.round(daysOnHand));
                result.put("total_materials", alertResult.get("total_materials"));
                result.put("urgent_alerts", alertResult.get("urgent_alerts"));
                result.put("out_of_stock", alertResult.get("out_of_stock"));
                result.put("abc_class_a_count", classACount);
                result.put("abc_class_b_count", classBCount);
                result.put("abc_class_c_count", classCCount);
                result.put("period_days", daysBetween);

                return result;
        }
}
