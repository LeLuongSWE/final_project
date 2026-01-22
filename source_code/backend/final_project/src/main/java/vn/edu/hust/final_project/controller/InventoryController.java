package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Material;
import vn.edu.hust.final_project.entity.StockTransaction;
import vn.edu.hust.final_project.service.InventoryService;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // ==================== Materials ====================

    @GetMapping("/materials")
    public ResponseEntity<List<Material>> getAllMaterials() {
        return ResponseEntity.ok(inventoryService.getAllMaterials());
    }

    @GetMapping("/materials/{id}")
    public ResponseEntity<Material> getMaterial(@PathVariable Long id) {
        return inventoryService.getMaterialById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/materials")
    public ResponseEntity<?> createMaterial(@RequestBody Material material) {
        try {
            Material saved = inventoryService.createMaterial(
                    material.getName(),
                    material.getUnit(),
                    material.getUnitPrice(),
                    material.getQuantityInStock(),
                    material.getMinStockLevel()
            );
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/materials/{id}")
    public ResponseEntity<?> updateMaterial(@PathVariable Long id, @RequestBody Material material) {
        try {
            return inventoryService.updateMaterial(
                    id,
                    material.getName(),
                    material.getUnit(),
                    material.getUnitPrice(),
                    material.getMinStockLevel()
            )
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        try {
            if (inventoryService.deleteMaterial(id)) {
                return ResponseEntity.ok(Map.of("success", true));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Stock Transactions ====================

    @GetMapping("/transactions")
    public ResponseEntity<List<StockTransaction>> getTransactions() {
        return ResponseEntity.ok(inventoryService.getAllTransactions());
    }

    @GetMapping("/transactions/search")
    public ResponseEntity<Map<String, Object>> searchTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(inventoryService.searchTransactions(page, size, type, materialId, startDate, endDate));
    }

    @PostMapping("/stock-in")
    public ResponseEntity<?> stockIn(@RequestBody StockInRequest request) {
        try {
            StockTransaction transaction = inventoryService.createStockIn(
                    request.getMaterialId(),
                    request.getQuantity(),
                    request.getUnitPrice(),
                    request.getNote(),
                    request.getCreatedBy()
            );
            return ResponseEntity.ok(Map.of("success", true, "transaction", transaction));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stock-out")
    public ResponseEntity<?> stockOut(@RequestBody StockOutRequest request) {
        try {
            StockTransaction transaction = inventoryService.createStockOut(
                    request.getMaterialId(),
                    request.getQuantity(),
                    request.getNote(),
                    request.getCreatedBy()
            );
            return ResponseEntity.ok(Map.of("success", true, "transaction", transaction));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Material>> getLowStockMaterials() {
        return ResponseEntity.ok(inventoryService.getLowStockMaterials());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        return ResponseEntity.ok(inventoryService.getInventorySummary());
    }

    // Request DTOs
    static class StockInRequest {
        private Long materialId;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private String note;
        private Long createdBy;

        public Long getMaterialId() { return materialId; }
        public void setMaterialId(Long materialId) { this.materialId = materialId; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public Long getCreatedBy() { return createdBy; }
        public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    }

    static class StockOutRequest {
        private Long materialId;
        private BigDecimal quantity;
        private String note;
        private Long createdBy;

        public Long getMaterialId() { return materialId; }
        public void setMaterialId(Long materialId) { this.materialId = materialId; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public Long getCreatedBy() { return createdBy; }
        public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    }
}
