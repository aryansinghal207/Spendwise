package com.spendwise.SpendWise.controller;

import com.spendwise.SpendWise.model.Goal;
import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.GoalRepository;
import com.spendwise.SpendWise.services.AuthService;
import com.spendwise.SpendWise.util.MoneyAmountUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository goals;
    private final AuthService auth;

    public GoalController(GoalRepository goals, AuthService auth) {
        this.goals = goals;
        this.auth = auth;
    }

    private UserProfile requireUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring("Bearer ".length());
        return auth.getByToken(token);
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        List<Goal> userGoals = goals.findByOwnerId(u.getId());
        return ResponseEntity.ok(userGoals);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        String name = (String) body.get("name");
        BigDecimal targetAmount = MoneyAmountUtil.parse(body.get("targetAmount"));
        BigDecimal currentAmount = MoneyAmountUtil.parse(body.get("currentAmount"));
        String targetDateStr = (String) body.get("targetDate");
        LocalDate targetDate = targetDateStr == null ? LocalDate.now().plusMonths(6) : LocalDate.parse(targetDateStr);
        String type = (String) body.getOrDefault("type", "savings");

        Goal goal = new Goal(u.getId(), name, targetAmount, currentAmount, targetDate, type);
        Goal saved = goals.save(goal);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Goal goal = goals.findById(id).orElse(null);
        if (goal == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(goal.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");

        if (body.get("name") != null) goal.setName((String) body.get("name"));
        if (body.get("targetAmount") != null) goal.setTargetAmount(MoneyAmountUtil.parse(body.get("targetAmount")));
        if (body.get("currentAmount") != null) goal.setCurrentAmount(MoneyAmountUtil.parse(body.get("currentAmount")));
        if (body.get("targetDate") != null) goal.setTargetDate(LocalDate.parse((String) body.get("targetDate")));
        if (body.get("status") != null) goal.setStatus((String) body.get("status"));
        if (body.get("type") != null) goal.setType((String) body.get("type"));

        goals.save(goal);
        return ResponseEntity.ok(goal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Goal goal = goals.findById(id).orElse(null);
        if (goal == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(goal.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");

        goals.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }

    @GetMapping("/achievements")
    public ResponseEntity<?> getAchievements(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        List<Goal> completedGoals = goals.findByOwnerIdAndStatus(u.getId(), "completed");
        List<Goal> activeGoals = goals.findByOwnerIdAndStatus(u.getId(), "active");

        Map<String, Object> achievements = new HashMap<>();
        achievements.put("completedGoals", completedGoals.size());
        achievements.put("activeGoals", activeGoals.size());
        BigDecimal totalGoalAmount = activeGoals.stream()
                .map(g -> g.getTargetAmount() == null ? BigDecimal.ZERO : g.getTargetAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal currentProgress = activeGoals.stream()
                .map(g -> g.getCurrentAmount() == null ? BigDecimal.ZERO : g.getCurrentAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        achievements.put("totalGoalAmount", totalGoalAmount);
        achievements.put("currentProgress", currentProgress);

        return ResponseEntity.ok(achievements);
    }
}
