package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.District;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, String> {
    List<District> findByProvinceCodeOrderByNameAsc(String provinceCode);
    List<District> findByProvinceCodeOrderByCodeAsc(String provinceCode);
}
