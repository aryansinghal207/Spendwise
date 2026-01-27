package com.spendwise.SpendWise.controller;

import com.spendwise.SpendWise.model.Debt;
import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.DebtRepository;
import com.spendwise.SpendWise.repository.UserProfileRepository;
import com.spendwise.SpendWise.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debts")
public class DebtController {

    private final DebtRepository debts;
    private final AuthService auth;
    private final UserProfileRepository users;

    public DebtController(DebtRepository debts, AuthService auth, UserProfileRepository users) {
        this.debts = debts;
        this.auth = auth;
        this.users = users;
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

        List<Debt> allDebts = debts.findPendingDebtsByUserId(u.getId());
        return ResponseEntity.ok(allDebts);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Long toUserId = body.get("toUserId") == null ? null : Long.valueOf(body.get("toUserId").toString());
        Double amount = body.get("amount") == null ? 0.0 : Double.valueOf(body.get("amount").toString());
        String description = (String) body.get("description");
        String dateStr = (String) body.get("date");
        LocalDate date = dateStr == null ? LocalDate.now() : LocalDate.parse(dateStr);

        Debt debt = new Debt(u.getId(), toUserId, amount, description, date);
        Debt saved = debts.save(debt);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/settle")
    public ResponseEntity<?> settle(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Debt debt = debts.findById(id).orElse(null);
        if (debt == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        
        // Only the person owed or the person owing can settle
        if (!u.getId().equals(debt.getFromUserId()) && !u.getId().equals(debt.getToUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized");
        }

        debt.setStatus("settled");
        debts.save(debt);
        return ResponseEntity.ok(debt);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        List<Debt> pendingDebts = debts.findPendingDebtsByUserId(u.getId());
        
        double totalOwed = pendingDebts.stream()
                .filter(d -> d.getFromUserId().equals(u.getId()))
                .mapToDouble(d -> d.getAmount() == null ? 0 : d.getAmount())
                .sum();
        
        double totalOwedToYou = pendingDebts.stream()
                .filter(d -> d.getToUserId().equals(u.getId()))
                .mapToDouble(d -> d.getAmount() == null ? 0 : d.getAmount())
                .sum();

        // Group by person
        Map<Long, Double> owedByPerson = new HashMap<>();
        Map<Long, Double> owedToPerson = new HashMap<>();

        for (Debt debt : pendingDebts) {
            if (debt.getFromUserId().equals(u.getId())) {
                Long toId = debt.getToUserId();
                double amt = debt.getAmount() == null ? 0 : debt.getAmount();
                owedByPerson.put(toId, owedByPerson.getOrDefault(toId, 0.0) + amt);
            } else if (debt.getToUserId().equals(u.getId())) {
                Long fromId = debt.getFromUserId();
                double amt = debt.getAmount() == null ? 0 : debt.getAmount();
                owedToPerson.put(fromId, owedToPerson.getOrDefault(fromId, 0.0) + amt);
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOwed", totalOwed);
        summary.put("totalOwedToYou", totalOwedToYou);
        summary.put("netBalance", totalOwedToYou - totalOwed);
        summary.put("owedByPerson", owedByPerson);
        summary.put("owedToPerson", owedToPerson);

        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Debt debt = debts.findById(id).orElse(null);
        if (debt == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        
        if (!u.getId().equals(debt.getFromUserId()) && !u.getId().equals(debt.getToUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized");
        }

        debts.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }
}
