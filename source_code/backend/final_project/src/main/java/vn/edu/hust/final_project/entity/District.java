package vn.edu.hust.final_project.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "districts")
public class District {
    @Id
    @Column(name = "code", length = 10)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "name_with_type", length = 150)
    private String nameWithType;

    @Column(name = "type", length = 20)
    private String type;

    @Column(name = "province_code", length = 10)
    private String provinceCode;
    
    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getNameWithType() { return nameWithType; }
    public void setNameWithType(String nameWithType) { this.nameWithType = nameWithType; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getProvinceCode() { return provinceCode; }
    public void setProvinceCode(String provinceCode) { this.provinceCode = provinceCode; }
}
