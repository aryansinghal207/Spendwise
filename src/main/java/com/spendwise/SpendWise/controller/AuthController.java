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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        String accountType = body.get("accountType") == null ? "individual" : body.get("accountType").toString().toLowerCase();

        if (email == null || password == null || name == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing fields");
        }

        if (!"individual".equals(accountType) && !"group".equals(accountType)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid account type");
        }

        if (repo.existsByEmailAndAccountType(email, accountType)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("This account type already exists for this email");
        }
        if (repo.countByEmail(email) >= 2) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("At most 2 account types are allowed per email");
        }

        UserProfile user = new UserProfile(name, email, monthlyIncome, null, accountType);
        String token = auth.signup(user, password);
        UserProfile saved = auth.getByToken(token);
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("user", mask(saved));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        String accountType = body.get("accountType") == null ? null : body.get("accountType").toString().toLowerCase();
        if (email == null || password == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing");
        String token = accountType == null ? auth.signin(email, password) : auth.signin(email, password, accountType);
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        UserProfile u = auth.getByToken(token);
        Map<String,Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("user", mask(u));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/switch-account")
    public ResponseEntity<?> switchAccount(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody Map<String, Object> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");
        }
        UserProfile current = auth.getByToken(authHeader.substring("Bearer ".length()));
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");

        String accountType = body.get("accountType") == null ? null : body.get("accountType").toString().toLowerCase();
        if (accountType == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing account type");

        UserProfile target = repo.findByEmailAndAccountType(current.getEmail(), accountType);
        if (target == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Requested account type not found for this email");

        String token = auth.issueTokenForUser(target);
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("user", mask(target));
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
        m.put("profileImageUrl", u.getProfileImageUrl());
        List<String> linkedTypes = repo.findAllByEmail(u.getEmail()).stream()
                .map(UserProfile::getAccountType)
                .filter(t -> t != null && !t.isBlank())
                .distinct()
                .collect(Collectors.toList());
        m.put("linkedAccountTypes", linkedTypes);
        return m;
    }
}
