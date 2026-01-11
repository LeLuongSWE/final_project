package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.StockTransaction;

import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByMaterialIdOrderByCreatedAtDesc(Long materialId);

    List<StockTransaction> findAllByOrderByCreatedAtDesc();

    List<StockTransaction> findTop50ByOrderByCreatedAtDesc();
}
