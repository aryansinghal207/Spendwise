package com.spendwise.SpendWise.controller;

import com.spendwise.SpendWise.model.Budget;
import com.spendwise.SpendWise.model.Expense;
import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.BudgetRepository;
import com.spendwise.SpendWise.repository.ExpenseRepository;
import com.spendwise.SpendWise.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgets;
    private final ExpenseRepository expenses;
    private final AuthService auth;

    public BudgetController(BudgetRepository budgets, ExpenseRepository expenses, AuthService auth) {
        this.budgets = budgets;
        this.expenses = expenses;
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
        List<Budget> userBudgets = budgets.findByOwnerId(u.getId());
        return ResponseEntity.ok(userBudgets);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        String category = (String) body.get("category");
        Double limitAmount = body.get("limitAmount") == null ? 0.0 : Double.valueOf(body.get("limitAmount").toString());
        String period = (String) body.getOrDefault("period", "monthly");
        Integer month = body.get("month") == null ? LocalDate.now().getMonthValue() : Integer.valueOf(body.get("month").toString());
        Integer year = body.get("year") == null ? LocalDate.now().getYear() : Integer.valueOf(body.get("year").toString());

        Budget budget = new Budget(u.getId(), category, limitAmount, period, month, year);
        Budget saved = budgets.save(budget);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Budget budget = budgets.findById(id).orElse(null);
        if (budget == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(budget.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");

        if (body.get("limitAmount") != null) budget.setLimitAmount(Double.valueOf(body.get("limitAmount").toString()));
        if (body.get("category") != null) budget.setCategory((String) body.get("category"));
        if (body.get("period") != null) budget.setPeriod((String) body.get("period"));
        if (body.get("month") != null) budget.setMonth(Integer.valueOf(body.get("month").toString()));
        if (body.get("year") != null) budget.setYear(Integer.valueOf(body.get("year").toString()));

        budgets.save(budget);
        return ResponseEntity.ok(budget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Budget budget = budgets.findById(id).orElse(null);
        if (budget == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(budget.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");

        budgets.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        List<Budget> userBudgets = budgets.findByOwnerId(u.getId());
        List<Expense> monthExpenses = expenses.findByOwnerId(u.getId()).stream()
                .filter(e -> e.getDate() != null && e.getDate().getMonthValue() == currentMonth && e.getDate().getYear() == currentYear)
                .toList();

        Map<String, Map<String, Object>> statusMap = new HashMap<>();

        for (Budget budget : userBudgets) {
            if (!"monthly".equals(budget.getPeriod())) continue;
            if (!budget.getMonth().equals(currentMonth) || !budget.getYear().equals(currentYear)) continue;

            double spent = monthExpenses.stream()
                    .filter(e -> budget.getCategory().equals(e.getCategory()))
                    .mapToDouble(e -> e.getAmount() == null ? 0 : e.getAmount())
                    .sum();

            double limit = budget.getLimitAmount() == null ? 0 : budget.getLimitAmount();
            double percentage = limit > 0 ? (spent / limit) * 100 : 0;
            boolean isOverBudget = spent > limit;
            boolean isNearLimit = percentage >= 80 && !isOverBudget;

            Map<String, Object> status = new HashMap<>();
            status.put("budgetId", budget.getId());
            status.put("category", budget.getCategory());
            status.put("limit", limit);
            status.put("spent", spent);
            status.put("remaining", limit - spent);
            status.put("percentage", percentage);
            status.put("isOverBudget", isOverBudget);
            status.put("isNearLimit", isNearLimit);

            statusMap.put(budget.getCategory(), status);
        }

        return ResponseEntity.ok(statusMap);
    }
}
