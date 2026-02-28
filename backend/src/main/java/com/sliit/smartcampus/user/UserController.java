package com.sliit.smartcampus.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
                .filter(foundUser -> passwordMatches(rawPassword, foundUser))
                .map(foundUser -> ResponseEntity.ok("Login successful"))
                .orElse(ResponseEntity.status(401).body("Invalid credentials"));
    }

    private boolean passwordMatches(String rawPassword, User foundUser) {
        String storedPassword = foundUser.getPassword();

        if (storedPassword != null && storedPassword.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        // Backward compatibility: migrate old plain-text passwords on successful login.
        if (rawPassword.equals(storedPassword)) {
            foundUser.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(foundUser);
            return true;
        }

        return false;
    }
}
