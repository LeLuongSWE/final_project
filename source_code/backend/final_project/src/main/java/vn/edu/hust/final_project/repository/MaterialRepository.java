package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.Material;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findAllByOrderByNameAsc();

    List<Material> findByQuantityInStockLessThanEqual(java.math.BigDecimal level);
}
