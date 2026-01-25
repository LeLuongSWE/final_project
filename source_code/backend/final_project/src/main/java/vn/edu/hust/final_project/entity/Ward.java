package vn.edu.hust.final_project.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wards")
public class Ward {
    @Id
    @Column(name = "code", length = 10)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "name_with_type", length = 150)
    private String nameWithType;

    @Column(name = "type", length = 20)
    private String type;

    @Column(name = "district_code", length = 10)
    private String districtCode;

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getNameWithType() { return nameWithType; }
    public void setNameWithType(String nameWithType) { this.nameWithType = nameWithType; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDistrictCode() { return districtCode; }
    public void setDistrictCode(String districtCode) { this.districtCode = districtCode; }
}
