package com.spendwise.SpendWise.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.UserProfileRepository;
import com.spendwise.SpendWise.services.AuthService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final UserProfileRepository repo;

    public AuthController(AuthService auth, UserProfileRepository repo) {
        this.auth = auth;
        this.repo = repo;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        Double monthlyIncome = body.get("monthlyIncome") == null ? 0.0 : Double.valueOf(body.get("monthlyIncome").toString());
        String accountType = (String) body.get("accountType");

        if (email == null || password == null || name == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing fields");
        }

        if (repo.findByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        UserProfile user = new UserProfile(name, email, monthlyIncome, null, accountType);
        String token = auth.signup(user, password);
        // fetch saved user from repo to ensure id and persisted fields are returned
        UserProfile saved = repo.findByEmail(email);
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("user", mask(saved));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        if (email == null || password == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing");
        String token = auth.signin(email, password);
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        UserProfile u = repo.findByEmail(email);
        Map<String,Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("user", mask(u));
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");
        String token = authHeader.substring("Bearer ".length());
        UserProfile u = auth.getByToken(token);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        return ResponseEntity.ok(mask(u));
    }

    private Map<String,Object> mask(UserProfile u) {
        Map<String,Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("monthlyIncome", u.getMonthlyIncome());
        m.put("accountType", u.getAccountType());
        return m;
    }
}
