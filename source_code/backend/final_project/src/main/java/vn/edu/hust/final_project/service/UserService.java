package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.hust.final_project.dto.UpdateProfileRequest;
import vn.edu.hust.final_project.dto.UserDTO;
import vn.edu.hust.final_project.entity.User;
import vn.edu.hust.final_project.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return convertToDTO(user);
    }
    
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Update fields if provided
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        
        if (request.getEmail() != null) {
            // Check if email is already used by another user
            if (!request.getEmail().isEmpty()) {
                userRepository.findByEmail(request.getEmail())
                        .ifPresent(existingUser -> {
                            if (!existingUser.getUserId().equals(userId)) {
                                throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác");
                            }
                        });
            }
            user.setEmail(request.getEmail().isEmpty() ? null : request.getEmail().trim());
        }
        
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().isEmpty() ? null : request.getPhone().trim());
        }
        
        user = userRepository.save(user);
        return convertToDTO(user);
    }
    
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRoleId(user.getRoleId());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Map role name based on role_id
        switch (user.getRoleId().intValue()) {
            case 1: dto.setRoleName("Admin"); break;
            case 2: dto.setRoleName("Cashier"); break;
            case 3: dto.setRoleName("Kitchen"); break;
            default: dto.setRoleName("Customer");
        }
        
        return dto;
    }
}
