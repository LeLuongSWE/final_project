package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.final_project.dto.AddressDTO;
import vn.edu.hust.final_project.entity.UserAddress;
import vn.edu.hust.final_project.repository.UserAddressRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserAddressService {
    
    @Autowired
    private UserAddressRepository addressRepository;
    
    public List<AddressDTO> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public AddressDTO getAddressById(Long addressId, Long userId) {
        UserAddress address = addressRepository.findByAddressIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
        return convertToDTO(address);
    }
    
    @Transactional
    public AddressDTO createAddress(Long userId, AddressDTO dto) {
        UserAddress address = new UserAddress();
        address.setUserId(userId);
        updateAddressFromDTO(address, dto);
        
        // If this is the first address, set as default
        if (addressRepository.countByUserId(userId) == 0) {
            address.setIsDefault(true);
        } else if (Boolean.TRUE.equals(dto.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
            address.setIsDefault(true);
        }
        
        address = addressRepository.save(address);
        return convertToDTO(address);
    }
    
    @Transactional
    public AddressDTO updateAddress(Long addressId, Long userId, AddressDTO dto) {
        UserAddress address = addressRepository.findByAddressIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
        
        updateAddressFromDTO(address, dto);
        
        if (Boolean.TRUE.equals(dto.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
            address.setIsDefault(true);
        }
        
        address = addressRepository.save(address);
        return convertToDTO(address);
    }
    
    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        UserAddress address = addressRepository.findByAddressIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
        
        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);
        
        // If deleted address was default, set another as default
        if (wasDefault) {
            List<UserAddress> remaining = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                addressRepository.save(remaining.get(0));
            }
        }
    }
    
    @Transactional
    public AddressDTO setDefaultAddress(Long addressId, Long userId) {
        UserAddress address = addressRepository.findByAddressIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
        
        addressRepository.clearDefaultForUser(userId);
        address.setIsDefault(true);
        address = addressRepository.save(address);
        
        return convertToDTO(address);
    }
    
    private void updateAddressFromDTO(UserAddress address, AddressDTO dto) {
        if (dto.getLabel() != null) address.setLabel(dto.getLabel());
        if (dto.getRecipientName() != null) address.setRecipientName(dto.getRecipientName());
        if (dto.getPhone() != null) address.setPhone(dto.getPhone());
        if (dto.getAddressLine() != null) address.setAddressLine(dto.getAddressLine());
        if (dto.getWard() != null) address.setWard(dto.getWard());
        if (dto.getDistrict() != null) address.setDistrict(dto.getDistrict());
        if (dto.getCity() != null) address.setCity(dto.getCity());
        if (dto.getLatitude() != null) address.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) address.setLongitude(dto.getLongitude());
    }
    
    private AddressDTO convertToDTO(UserAddress address) {
        AddressDTO dto = new AddressDTO();
        dto.setAddressId(address.getAddressId());
        dto.setLabel(address.getLabel());
        dto.setRecipientName(address.getRecipientName());
        dto.setPhone(address.getPhone());
        dto.setAddressLine(address.getAddressLine());
        dto.setWard(address.getWard());
        dto.setDistrict(address.getDistrict());
        dto.setCity(address.getCity());
        dto.setLatitude(address.getLatitude());
        dto.setLongitude(address.getLongitude());
        dto.setIsDefault(address.getIsDefault());
        return dto;
    }
}
