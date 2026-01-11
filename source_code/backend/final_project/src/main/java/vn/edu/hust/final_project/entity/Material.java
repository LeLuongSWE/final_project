package vn.edu.hust.final_project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
public class Material {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "material_id")
    private Long materialId;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;
    
    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(name = "quantity_in_stock", precision = 10, scale = 2)
    private BigDecimal quantityInStock;
    
    @Column(name = "min_stock_level", precision = 10, scale = 2)
    private BigDecimal minStockLevel;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (unitPrice == null) unitPrice = BigDecimal.ZERO;
        if (quantityInStock == null) quantityInStock = BigDecimal.ZERO;
        if (minStockLevel == null) minStockLevel = BigDecimal.ZERO;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getMaterialId() { return materialId; }
    public void setMaterialId(Long materialId) { this.materialId = materialId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getQuantityInStock() { return quantityInStock; }
    public void setQuantityInStock(BigDecimal quantityInStock) { this.quantityInStock = quantityInStock; }
    
    public BigDecimal getMinStockLevel() { return minStockLevel; }
    public void setMinStockLevel(BigDecimal minStockLevel) { this.minStockLevel = minStockLevel; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Check if low stock
    public boolean isLowStock() {
        return quantityInStock != null && minStockLevel != null 
            && quantityInStock.compareTo(minStockLevel) <= 0;
    }
}
