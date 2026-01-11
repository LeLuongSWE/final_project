package vn.edu.hust.final_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.hust.final_project.dto.AuthResponse;
import vn.edu.hust.final_project.dto.LoginRequest;
import vn.edu.hust.final_project.dto.RegisterRequest;
import vn.edu.hust.final_project.dto.UserDTO;
import vn.edu.hust.final_project.entity.User;
import vn.edu.hust.final_project.repository.UserRepository;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        }
        
        String token = jwtService.generateToken(user);
        UserDTO userDTO = convertToDTO(user);
        
        return new AuthResponse(token, userDTO);
    }
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRoleId(4L); // Default role: CUSTOMER
        
        user = userRepository.save(user);
        
        return new AuthResponse("Đăng ký thành công");
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setRoleId(user.getRoleId());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Map role name based on role_id
        switch (user.getRoleId().intValue()) {
            case 1:
                dto.setRoleName("Admin");
                break;
            case 2:
                dto.setRoleName("Cashier");
                break;
            case 3:
                dto.setRoleName("Kitchen");
                break;
            default:
                dto.setRoleName("Customer");
        }
        
        return dto;
    }
}
