package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.Product;
import vn.edu.hust.final_project.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProductsIncludingInactive() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
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
            Product product = new Product();
            product.setName((String) request.get("name"));
            product.setPrice(new BigDecimal(request.get("price").toString()));
            product.setCategory((String) request.getOrDefault("category", "MÓN MẶN"));
            product.setIsActive(true);

            // Handle image - can be Base64 data or URL
            String imageData = (String) request.get("imageData");
            String imageUrl = (String) request.get("imageUrl");

            if (imageData != null && !imageData.isEmpty()) {
                product.setImageData(imageData);
            }
            if (imageUrl != null && !imageUrl.isEmpty()) {
                product.setImageUrl(imageUrl);
            }

            Product saved = productRepository.save(product);
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
        return productRepository.findById(id)
                .map(product -> {
                    if (request.containsKey("name")) {
                        product.setName((String) request.get("name"));
                    }
                    if (request.containsKey("price")) {
                        product.setPrice(new BigDecimal(request.get("price").toString()));
                    }
                    if (request.containsKey("category")) {
                        product.setCategory((String) request.get("category"));
                    }
                    if (request.containsKey("isActive")) {
                        product.setIsActive((Boolean) request.get("isActive"));
                    }
                    if (request.containsKey("imageData")) {
                        String imageData = (String) request.get("imageData");
                        product.setImageData(imageData != null && !imageData.isEmpty() ? imageData : null);
                    }
                    if (request.containsKey("imageUrl")) {
                        product.setImageUrl((String) request.get("imageUrl"));
                    }

                    Product saved = productRepository.save(product);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete product (soft delete - set isActive = false)
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setIsActive(false);
                    productRepository.save(product);
                    return ResponseEntity.ok(Map.of("message", "Product deactivated", "id", id));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Hard delete product
     * DELETE /api/products/{id}/hard
     */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<?> hardDeleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.ok(Map.of("message", "Product deleted permanently", "id", id));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
