package vn.edu.hust.final_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.final_project.entity.Ward;

import java.util.List;

@Repository
public interface WardRepository extends JpaRepository<Ward, String> {
    List<Ward> findByDistrictCodeOrderByNameAsc(String districtCode);
    List<Ward> findByDistrictCodeOrderByCodeAsc(String districtCode);
}
