package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.final_project.entity.Material;
import vn.edu.hust.final_project.entity.StockTransaction;
import vn.edu.hust.final_project.repository.MaterialRepository;
import vn.edu.hust.final_project.repository.StockTransactionRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class InventoryService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ========== Material Operations ==========

    /**
     * Get all materials
     */
    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    /**
     * Get material by ID
     */
    public Optional<Material> getMaterialById(Long materialId) {
        return materialRepository.findById(materialId);
    }

    /**
     * Create new material
     */
    @Transactional
    public Material createMaterial(String name, String unit, BigDecimal unitPrice, 
            BigDecimal quantityInStock, BigDecimal minStockLevel) {
        Material material = new Material();
        material.setName(name);
        material.setUnit(unit);
        material.setUnitPrice(unitPrice);
        material.setQuantityInStock(quantityInStock != null ? quantityInStock : BigDecimal.ZERO);
        material.setMinStockLevel(minStockLevel != null ? minStockLevel : BigDecimal.ZERO);
        return materialRepository.save(material);
    }

    /**
     * Update material
     */
    @Transactional
    public Optional<Material> updateMaterial(Long materialId, String name, String unit, 
            BigDecimal unitPrice, BigDecimal minStockLevel) {
        return materialRepository.findById(materialId).map(material -> {
            if (name != null) material.setName(name);
            if (unit != null) material.setUnit(unit);
            if (unitPrice != null) material.setUnitPrice(unitPrice);
            if (minStockLevel != null) material.setMinStockLevel(minStockLevel);
            return materialRepository.save(material);
        });
    }

    /**
     * Delete material
     */
    @Transactional
    public boolean deleteMaterial(Long materialId) {
        if (materialRepository.existsById(materialId)) {
            materialRepository.deleteById(materialId);
            return true;
        }
        return false;
    }

    /**
     * Get low stock materials
     */
    public List<Material> getLowStockMaterials() {
        return materialRepository.findMaterialsWithLowStock();
    }

    // ========== Stock Transaction Operations ==========

    /**
     * Get all stock transactions
     */
    public List<StockTransaction> getAllTransactions() {
        return stockTransactionRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get transactions by material ID
     */
    public List<StockTransaction> getTransactionsByMaterial(Long materialId) {
        return stockTransactionRepository.findByMaterialIdOrderByCreatedAtDesc(materialId);
    }

    /**
     * Create stock IN transaction (nhập kho)
     */
    @Transactional
    public StockTransaction createStockIn(Long materialId, BigDecimal quantity, 
            BigDecimal unitPrice, String note, Long createdBy) {
        
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        StockTransaction transaction = new StockTransaction();
        transaction.setMaterialId(materialId);
        transaction.setType("IN");
        transaction.setQuantity(quantity);
        transaction.setUnitPrice(unitPrice);
        transaction.setNote(note);
        transaction.setCreatedBy(createdBy);
        transaction.setCreatedAt(LocalDateTime.now());

        // Update material stock
        material.setQuantityInStock(material.getQuantityInStock().add(quantity));
        material.setUnitPrice(unitPrice); // Update latest unit price
        materialRepository.save(material);

        return stockTransactionRepository.save(transaction);
    }

    /**
     * Create stock OUT transaction (xuất kho)
     */
    @Transactional
    public StockTransaction createStockOut(Long materialId, BigDecimal quantity, 
            String note, Long createdBy) {
        
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        if (material.getQuantityInStock().compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient stock");
        }

        StockTransaction transaction = new StockTransaction();
        transaction.setMaterialId(materialId);
        transaction.setType("OUT");
        transaction.setQuantity(quantity);
        transaction.setUnitPrice(material.getUnitPrice());
        transaction.setNote(note);
        transaction.setCreatedBy(createdBy);
        transaction.setCreatedAt(LocalDateTime.now());

        // Update material stock
        material.setQuantityInStock(material.getQuantityInStock().subtract(quantity));
        materialRepository.save(material);

        return stockTransactionRepository.save(transaction);
    }

    /**
     * Search transactions with filters
     */
    public Map<String, Object> searchTransactions(int page, int size, String type, 
            Long materialId, String startDate, String endDate) {
        
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT t.*, m.name as material_name, m.unit ");
        sql.append("FROM stock_transactions t ");
        sql.append("JOIN materials m ON t.material_id = m.material_id ");
        sql.append("WHERE 1=1 ");

        StringBuilder countSql = new StringBuilder();
        countSql.append("SELECT COUNT(*) FROM stock_transactions t WHERE 1=1 ");

        List<Object> params = new ArrayList<>();
        List<Object> countParams = new ArrayList<>();

        if (type != null && !type.isEmpty()) {
            sql.append("AND t.type = ? ");
            countSql.append("AND t.type = ? ");
            params.add(type);
            countParams.add(type);
        }

        if (materialId != null) {
            sql.append("AND t.material_id = ? ");
            countSql.append("AND t.material_id = ? ");
            params.add(materialId);
            countParams.add(materialId);
        }

        if (startDate != null && !startDate.isEmpty()) {
            sql.append("AND t.created_at >= ?::timestamp ");
            countSql.append("AND t.created_at >= ?::timestamp ");
            params.add(startDate + " 00:00:00");
            countParams.add(startDate + " 00:00:00");
        }

        if (endDate != null && !endDate.isEmpty()) {
            sql.append("AND t.created_at <= ?::timestamp ");
            countSql.append("AND t.created_at <= ?::timestamp ");
            params.add(endDate + " 23:59:59");
            countParams.add(endDate + " 23:59:59");
        }

        sql.append("ORDER BY t.created_at DESC ");
        sql.append("LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        Long totalCount = jdbcTemplate.queryForObject(countSql.toString(), Long.class, countParams.toArray());
        List<Map<String, Object>> transactions = jdbcTemplate.queryForList(sql.toString(), params.toArray());

        Map<String, Object> result = new HashMap<>();
        result.put("content", transactions);
        result.put("totalElements", totalCount != null ? totalCount : 0);
        result.put("totalPages", (int) Math.ceil((double) (totalCount != null ? totalCount : 0) / size));
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    /**
     * Get inventory summary
     */
    public Map<String, Object> getInventorySummary() {
        List<Material> allMaterials = materialRepository.findAll();
        List<Material> lowStock = getLowStockMaterials();
        
        BigDecimal totalValue = allMaterials.stream()
                .map(m -> m.getQuantityInStock().multiply(m.getUnitPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalMaterials", allMaterials.size());
        summary.put("lowStockCount", lowStock.size());
        summary.put("totalInventoryValue", totalValue);
        summary.put("lowStockItems", lowStock);

        return summary;
    }
}
