package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Material;
import vn.edu.hust.final_project.entity.StockTransaction;
import vn.edu.hust.final_project.repository.MaterialRepository;
import vn.edu.hust.final_project.repository.StockTransactionRepository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    // ==================== Materials ====================

    @GetMapping("/materials")
    public ResponseEntity<List<Material>> getAllMaterials() {
        List<Material> materials = materialRepository.findAllByOrderByNameAsc();
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/materials/{id}")
    public ResponseEntity<Material> getMaterial(@PathVariable Long id) {
        return materialRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/materials")
    public ResponseEntity<?> createMaterial(@RequestBody Material material) {
        try {
            Material saved = materialRepository.save(material);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/materials/{id}")
    public ResponseEntity<?> updateMaterial(@PathVariable Long id, @RequestBody Material material) {
        try {
            Optional<Material> existing = materialRepository.findById(id);
            if (existing.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Material m = existing.get();
            if (material.getName() != null)
                m.setName(material.getName());
            if (material.getUnit() != null)
                m.setUnit(material.getUnit());
            if (material.getUnitPrice() != null)
                m.setUnitPrice(material.getUnitPrice());
            if (material.getMinStockLevel() != null)
                m.setMinStockLevel(material.getMinStockLevel());
            // Note: quantityInStock is managed through stock-in/stock-out, not direct edit

            Material saved = materialRepository.save(m);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        try {
            materialRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Stock Transactions ====================

    @GetMapping("/transactions")
    public ResponseEntity<List<Map<String, Object>>> getTransactions() {
        List<StockTransaction> transactions = stockTransactionRepository.findTop50ByOrderByCreatedAtDesc();
        Map<Long, Material> materialsMap = materialRepository.findAll().stream()
                .collect(Collectors.toMap(Material::getMaterialId, m -> m));

        List<Map<String, Object>> result = transactions.stream().map(t -> {
            Map<String, Object> item = new HashMap<>();
            item.put("transactionId", t.getTransactionId());
            item.put("materialId", t.getMaterialId());
            item.put("materialName", materialsMap.get(t.getMaterialId()) != null
                    ? materialsMap.get(t.getMaterialId()).getName()
                    : "Unknown");
            item.put("materialUnit", materialsMap.get(t.getMaterialId()) != null
                    ? materialsMap.get(t.getMaterialId()).getUnit()
                    : "");
            item.put("type", t.getType());
            item.put("quantity", t.getQuantity());
            item.put("unitPrice", t.getUnitPrice());
            item.put("note", t.getNote());
            item.put("createdAt", t.getCreatedAt());
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/stock-in")
    public ResponseEntity<?> stockIn(@RequestBody StockInRequest request) {
        try {
            Optional<Material> optMaterial = materialRepository.findById(request.getMaterialId());
            if (optMaterial.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nguyên liệu không tồn tại"));
            }

            Material material = optMaterial.get();

            // Create transaction
            StockTransaction transaction = new StockTransaction();
            transaction.setMaterialId(request.getMaterialId());
            transaction.setType("IN");
            transaction.setQuantity(request.getQuantity());
            transaction.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : material.getUnitPrice());
            transaction.setNote(request.getNote());
            stockTransactionRepository.save(transaction);

            // Update material stock
            BigDecimal newStock = material.getQuantityInStock().add(request.getQuantity());
            material.setQuantityInStock(newStock);
            if (request.getUnitPrice() != null) {
                material.setUnitPrice(request.getUnitPrice());
            }
            materialRepository.save(material);

            return ResponseEntity.ok(Map.of("success", true, "newStock", newStock));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stock-out")
    public ResponseEntity<?> stockOut(@RequestBody StockOutRequest request) {
        try {
            Optional<Material> optMaterial = materialRepository.findById(request.getMaterialId());
            if (optMaterial.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nguyên liệu không tồn tại"));
            }

            Material material = optMaterial.get();

            // Check if enough stock
            if (material.getQuantityInStock().compareTo(request.getQuantity()) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không đủ tồn kho"));
            }

            // Create transaction
            StockTransaction transaction = new StockTransaction();
            transaction.setMaterialId(request.getMaterialId());
            transaction.setType("OUT");
            transaction.setQuantity(request.getQuantity());
            transaction.setUnitPrice(material.getUnitPrice());
            transaction.setNote(request.getNote());
            stockTransactionRepository.save(transaction);

            // Update material stock
            BigDecimal newStock = material.getQuantityInStock().subtract(request.getQuantity());
            material.setQuantityInStock(newStock);
            materialRepository.save(material);

            return ResponseEntity.ok(Map.of("success", true, "newStock", newStock));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Material>> getLowStockMaterials() {
        List<Material> all = materialRepository.findAll();
        List<Material> lowStock = all.stream()
                .filter(Material::isLowStock)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lowStock);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        List<Material> materials = materialRepository.findAll();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalMaterials", materials.size());
        summary.put("lowStockCount", materials.stream().filter(Material::isLowStock).count());
        summary.put("totalValue", materials.stream()
                .map(m -> m.getQuantityInStock().multiply(m.getUnitPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return ResponseEntity.ok(summary);
    }

    // Request DTOs
    static class StockInRequest {
        private Long materialId;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private String note;

        public Long getMaterialId() {
            return materialId;
        }

        public void setMaterialId(Long materialId) {
            this.materialId = materialId;
        }

        public BigDecimal getQuantity() {
            return quantity;
        }

        public void setQuantity(BigDecimal quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }
    }

    static class StockOutRequest {
        private Long materialId;
        private BigDecimal quantity;
        private String note;

        public Long getMaterialId() {
            return materialId;
        }

        public void setMaterialId(Long materialId) {
            this.materialId = materialId;
        }

        public BigDecimal getQuantity() {
            return quantity;
        }

        public void setQuantity(BigDecimal quantity) {
            this.quantity = quantity;
        }

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }
    }
}
