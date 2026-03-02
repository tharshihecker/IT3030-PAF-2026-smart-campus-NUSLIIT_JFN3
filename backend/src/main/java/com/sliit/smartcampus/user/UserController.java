package com.sliit.smartcampus.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (user.getUsername() == null || user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        String username = user.getUsername().trim();
        String email = user.getEmail().trim();

        if (username.isEmpty() || email.isEmpty() || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Invalid signup data");
        }

        if (userRepository.findByUsernameIgnoreCase(username).isPresent() ||
            userRepository.findByEmailIgnoreCase(email).isPresent()) {
            return ResponseEntity.badRequest().body("Username or email already exists");
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.USER);
        user.setEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok("Signup successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Missing username or password");
        }

        String username = user.getUsername().trim();
        String rawPassword = user.getPassword();

        return userRepository.findByUsernameIgnoreCase(username)
                .filter(foundUser -> foundUser.isEnabled() && passwordMatches(rawPassword, foundUser))
                .map(foundUser -> ResponseEntity.ok((Object) Map.of(
                        "message", "Login successful",
                        "userId", Objects.requireNonNull(foundUser.getId()),
                        "username", foundUser.getUsername(),
                        "email", foundUser.getEmail(),
                        "role", foundUser.getRole().name(),
                        "fullName", foundUser.getFullName() != null ? foundUser.getFullName() : "",
                        "department", foundUser.getDepartment() != null ? foundUser.getDepartment() : ""
                )))
                .orElse(ResponseEntity.status(401).body("Invalid credentials"));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable long userId) {
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok((Object) Map.of(
                        "id", Objects.requireNonNull(u.getId()),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "fullName", u.getFullName() != null ? u.getFullName() : "",
                        "phone", u.getPhone() != null ? u.getPhone() : "",
                        "department", u.getDepartment() != null ? u.getDepartment() : "",
                        "bio", u.getBio() != null ? u.getBio() : "",
                        "role", u.getRole().name(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable long userId, @RequestBody Map<String, String> updates) {
        return userRepository.findById(userId)
                .map(u -> {
                    if (updates.containsKey("fullName")) u.setFullName(updates.get("fullName"));
                    if (updates.containsKey("phone")) u.setPhone(updates.get("phone"));
                    if (updates.containsKey("department")) u.setDepartment(updates.get("department"));
                    if (updates.containsKey("bio")) u.setBio(updates.get("bio"));
                    if (updates.containsKey("email")) {
                        String newEmail = updates.get("email").trim();
                        var existing = userRepository.findByEmailIgnoreCase(newEmail);
                        Long existingUserId = existing.map(User::getId).orElse(null);
                        if (existingUserId != null && existingUserId != userId) {
                            return ResponseEntity.badRequest().body((Object) "Email already in use");
                        }
                        u.setEmail(newEmail);
                    }
                    userRepository.save(u);
                    return ResponseEntity.ok((Object) "Profile updated successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/change-password/{userId}")
    public ResponseEntity<?> changePassword(@PathVariable long userId, @RequestBody Map<String, String> payload) {
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 4) {
            return ResponseEntity.badRequest().body("Invalid password data");
        }

        return userRepository.findById(userId)
                .map(u -> {
                    if (!passwordMatches(currentPassword, u)) {
                        return ResponseEntity.badRequest().body((Object) "Current password is incorrect");
                    }
                    u.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(u);
                    return ResponseEntity.ok((Object) "Password changed successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean passwordMatches(String rawPassword, User foundUser) {
        String storedPassword = foundUser.getPassword();

        if (storedPassword != null && storedPassword.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        if (rawPassword.equals(storedPassword)) {
            foundUser.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(foundUser);
            return true;
        }

        return false;
    }
}
