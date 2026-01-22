package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.final_project.entity.Product;
import vn.edu.hust.final_project.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get all products
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Get all active products for menu display
     */
    public List<Product> getActiveProducts() {
        return productRepository.findByIsActiveTrueOrderByNameAsc();
    }

    /**
     * Get product by ID
     */
    public Optional<Product> getProductById(Long productId) {
        return productRepository.findById(productId);
    }

    /**
     * Create new product
     */
    @Transactional
    public Product createProduct(String name, BigDecimal price, String category, 
            String imageData, Boolean isActive) {
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setCategory(category != null ? category : "MÓN MẶN");
        product.setImageData(imageData);
        product.setIsActive(isActive != null ? isActive : true);
        return productRepository.save(product);
    }

    /**
     * Update existing product
     */
    @Transactional
    public Optional<Product> updateProduct(Long productId, String name, BigDecimal price, 
            String category, String imageData, Boolean isActive) {
        return productRepository.findById(productId).map(product -> {
            if (name != null) product.setName(name);
            if (price != null) product.setPrice(price);
            if (category != null) product.setCategory(category);
            if (imageData != null) product.setImageData(imageData);
            if (isActive != null) product.setIsActive(isActive);
            return productRepository.save(product);
        });
    }

    /**
     * Toggle product active status
     */
    @Transactional
    public Optional<Product> toggleProductStatus(Long productId) {
        return productRepository.findById(productId).map(product -> {
            product.setIsActive(!product.getIsActive());
            return productRepository.save(product);
        });
    }

    /**
     * Delete product
     */
    @Transactional
    public boolean deleteProduct(Long productId) {
        if (productRepository.existsById(productId)) {
            productRepository.deleteById(productId);
            return true;
        }
        return false;
    }

    /**
     * Get products by category
     */
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndIsActiveTrueOrderByNameAsc(category);
    }

    /**
     * Get all distinct categories
     */
    public List<String> getAllCategories() {
        return productRepository.findDistinctCategories();
    }
}
