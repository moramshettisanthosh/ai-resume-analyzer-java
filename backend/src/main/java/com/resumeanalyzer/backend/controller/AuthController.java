package com.resumeanalyzer.backend.controller;

import com.resumeanalyzer.backend.model.User;
import com.resumeanalyzer.backend.repository.UserRepository;
import com.resumeanalyzer.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public static class AuthRequest {
        public String username;
        public String password;
    }

    public static class AuthResponse {
        public String token;
        public String username;
        public AuthResponse(String token, String username) { this.token = token; this.username = username;}
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.username).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        User user = new User();
        user.setUsername(request.username);
        user.setPassword(passwordEncoder.encode(request.password));
        userRepository.save(user);

        String jwt = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username, request.password)
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid Username or Password");
        }

        User user = userRepository.findByUsername(request.username).orElseThrow();
        String jwt = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername()));
    }
}
