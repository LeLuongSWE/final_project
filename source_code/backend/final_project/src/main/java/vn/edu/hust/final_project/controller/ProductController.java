package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Product;
import vn.edu.hust.final_project.service.ProductService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getActiveProducts());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProductsIncludingInactive() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new product with image
     * POST /api/products
     * Body: { name, price, category, imageData (Base64) }
     */
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            BigDecimal price = new BigDecimal(request.get("price").toString());
            String category = (String) request.getOrDefault("category", "MÓN MẶN");
            String imageData = (String) request.get("imageData");
            Boolean isActive = true;

            Product saved = productService.createProduct(name, price, category, imageData, isActive);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update product with optional image
     * PUT /api/products/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            String name = request.containsKey("name") ? (String) request.get("name") : null;
            BigDecimal price = request.containsKey("price") ? new BigDecimal(request.get("price").toString()) : null;
            String category = request.containsKey("category") ? (String) request.get("category") : null;
            String imageData = request.containsKey("imageData") ? (String) request.get("imageData") : null;
            Boolean isActive = request.containsKey("isActive") ? (Boolean) request.get("isActive") : null;

            return productService.updateProduct(id, name, price, category, imageData, isActive)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete product (soft delete - set isActive = false)
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productService.toggleProductStatus(id)
                .map(product -> ResponseEntity.ok(Map.of("message", "Product status toggled", "id", id, "isActive", product.getIsActive())))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Hard delete product
     * DELETE /api/products/{id}/hard
     */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<?> hardDeleteProduct(@PathVariable Long id) {
        if (productService.deleteProduct(id)) {
            return ResponseEntity.ok(Map.of("message", "Product deleted permanently", "id", id));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get products by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    /**
     * Get all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }
}
