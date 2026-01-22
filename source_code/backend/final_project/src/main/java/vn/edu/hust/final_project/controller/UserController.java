package vn.edu.hust.final_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.final_project.dto.*;
import vn.edu.hust.final_project.entity.User;
import vn.edu.hust.final_project.repository.UserRepository;
import vn.edu.hust.final_project.service.UserAddressService;
import vn.edu.hust.final_project.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserAddressService addressService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get current user profile
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Long userId = getCurrentUserId();
            UserDTO user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Update current user profile
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            Long userId = getCurrentUserId();
            UserDTO user = userService.updateProfile(userId, request);
            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thông tin thành công",
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Change password
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Long userId = getCurrentUserId();
            userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // ==================== ADDRESS ENDPOINTS ====================
    
    /**
     * Get all addresses for current user
     */
    @GetMapping("/me/addresses")
    public ResponseEntity<?> getAddresses() {
        try {
            Long userId = getCurrentUserId();
            List<AddressDTO> addresses = addressService.getAddressesByUserId(userId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Create new address
     */
    @PostMapping("/me/addresses")
    public ResponseEntity<?> createAddress(@RequestBody AddressDTO request) {
        try {
            Long userId = getCurrentUserId();
            AddressDTO address = addressService.createAddress(userId, request);
            return ResponseEntity.ok(Map.of(
                "message", "Thêm địa chỉ thành công",
                "address", address
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Update address
     */
    @PutMapping("/me/addresses/{addressId}")
    public ResponseEntity<?> updateAddress(@PathVariable Long addressId, @RequestBody AddressDTO request) {
        try {
            Long userId = getCurrentUserId();
            AddressDTO address = addressService.updateAddress(addressId, userId, request);
            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật địa chỉ thành công",
                "address", address
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Delete address
     */
    @DeleteMapping("/me/addresses/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long addressId) {
        try {
            Long userId = getCurrentUserId();
            addressService.deleteAddress(addressId, userId);
            return ResponseEntity.ok(Map.of("message", "Xóa địa chỉ thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Set address as default
     */
    @PutMapping("/me/addresses/{addressId}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long addressId) {
        try {
            Long userId = getCurrentUserId();
            AddressDTO address = addressService.setDefaultAddress(addressId, userId);
            return ResponseEntity.ok(Map.of(
                "message", "Đã đặt làm địa chỉ mặc định",
                "address", address
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return user.getUserId();
    }
}
