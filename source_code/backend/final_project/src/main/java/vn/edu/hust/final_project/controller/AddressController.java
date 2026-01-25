package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.entity.District;
import vn.edu.hust.final_project.entity.Province;
import vn.edu.hust.final_project.entity.Ward;
import vn.edu.hust.final_project.repository.DistrictRepository;
import vn.edu.hust.final_project.repository.ProvinceRepository;
import vn.edu.hust.final_project.repository.WardRepository;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private WardRepository wardRepository;

    @GetMapping("/provinces")
    public ResponseEntity<List<Province>> getProvinces() {
        return ResponseEntity.ok(provinceRepository.findAllByOrderByNameAsc());
    }

    @GetMapping("/provinces/{provinceCode}/districts")
    public ResponseEntity<List<District>> getDistricts(@PathVariable String provinceCode) {
        return ResponseEntity.ok(districtRepository.findByProvinceCodeOrderByNameAsc(provinceCode));
    }

    @GetMapping("/districts/{districtCode}/wards")
    public ResponseEntity<List<Ward>> getWards(@PathVariable String districtCode) {
        return ResponseEntity.ok(wardRepository.findByDistrictCodeOrderByNameAsc(districtCode));
    }
}
