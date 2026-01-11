package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.Shift;

import java.util.Optional;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    Optional<Shift> findByCashierIdAndStatus(Long cashierId, String status);
    List<Shift> findByCashierIdOrderByStartTimeDesc(Long cashierId);
    List<Shift> findByStatus(String status);
}
