package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.Province;

import java.util.List;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, String> {
    List<Province> findAllByOrderByCodeAsc();
    // Also support ordering by name
    List<Province> findAllByOrderByNameAsc();
}
