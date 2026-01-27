package com.spendwise.SpendWise.services;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.UserProfileRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class AuthService {

    private final UserProfileRepository repo;
    // token -> userId
    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserProfileRepository repo) {
        this.repo = repo;
    }

    public String signup(UserProfile user, String rawPassword) {
        // hash
        String hashed = encoder.encode(rawPassword);
        user.setPassword(hashed);
        UserProfile saved = repo.save(user);
        String token = UUID.randomUUID().toString();
        tokens.put(token, saved.getId());
        return token;
    }

    public String signin(String email, String rawPassword) {
        UserProfile u = repo.findByEmail(email);
        if (u == null) return null;
        if (!encoder.matches(rawPassword, u.getPassword())) return null;
        String token = UUID.randomUUID().toString();
        tokens.put(token, u.getId());
        return token;
    }

    public UserProfile getByToken(String token) {
        Long id = tokens.get(token);
        if (id == null) return null;
        return repo.findById(id).orElse(null);
    }
}
