package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();
    
    List<Product> findByIsActiveTrueOrderByNameAsc();
    
    List<Product> findByCategoryAndIsActiveTrueOrderByNameAsc(String category);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p.category FROM Product p ORDER BY p.category")
    List<String> findDistinctCategories();
}
