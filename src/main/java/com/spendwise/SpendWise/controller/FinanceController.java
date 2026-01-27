package com.spendwise.SpendWise.controller;

import com.spendwise.SpendWise.model.Income;
import com.spendwise.SpendWise.model.Expense;
import com.spendwise.SpendWise.model.Investment;
import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.IncomeRepository;
import com.spendwise.SpendWise.repository.ExpenseRepository;
import com.spendwise.SpendWise.repository.InvestmentRepository;
import com.spendwise.SpendWise.repository.UserProfileRepository;
import com.spendwise.SpendWise.services.AuthService;
import com.spendwise.SpendWise.services.FinanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final IncomeRepository incomes;
    private final ExpenseRepository expenses;
    private final InvestmentRepository investments;
    private final AuthService auth;
    private final UserProfileRepository usersRepo;
    private final FinanceService financeService;

    public FinanceController(IncomeRepository incomes, ExpenseRepository expenses, InvestmentRepository investments, AuthService auth, UserProfileRepository usersRepo, FinanceService financeService) {
        this.incomes = incomes;
        this.expenses = expenses;
        this.investments = investments;
        this.auth = auth;
        this.usersRepo = usersRepo;
        this.financeService = financeService;
    }

    private UserProfile requireUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring("Bearer ".length());
        return auth.getByToken(token);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        // incomes stored as records plus monthlyIncome values on profiles
        List<Income> inc = incomes.findByOwnerId(u.getId());
        List<Expense> exp = expenses.findByOwnerId(u.getId());
        List<Investment> inv = investments.findByOwnerId(u.getId());

        double incomesSum = inc.stream().mapToDouble(i -> i.getAmount() == null ? 0 : i.getAmount()).sum();
        // include profile monthlyIncome for the current user and their members (if any)
        double profileMonthly = u.getMonthlyIncome() == null ? 0 : u.getMonthlyIncome();
        double membersMonthly = usersRepo.findByOwnerId(u.getId()).stream().mapToDouble(m -> m.getMonthlyIncome() == null ? 0 : m.getMonthlyIncome()).sum();
        double totalIncome = profileMonthly + membersMonthly + incomesSum;
        double totalExpense = exp.stream().mapToDouble(e -> e.getAmount() == null ? 0 : e.getAmount()).sum();
        double totalInvest = inv.stream().mapToDouble(iv -> iv.getAmount() == null ? 0 : iv.getAmount()).sum();

        Map<String,Object> resp = new HashMap<>();
        resp.put("incomes", inc);
        resp.put("expenses", exp);
        resp.put("investments", inv);
        resp.put("totalIncome", totalIncome);
        resp.put("totalExpense", totalExpense);
        resp.put("totalInvestment", totalInvest);
        resp.put("net", totalIncome - totalExpense - totalInvest);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/incomes")
    public ResponseEntity<?> listIncomes(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        List<Income> inc = incomes.findByOwnerIdOrId(u.getId(), u.getId());
        return ResponseEntity.ok(inc);
    }

    @PutMapping("/incomes/{id}")
    public ResponseEntity<?> updateIncome(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id, @RequestBody Map<String,Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        Income inc = incomes.findById(id).orElse(null);
        if (inc == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(inc.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");
        if (body.get("amount") != null) inc.setAmount(Double.valueOf(body.get("amount").toString()));
        if (body.get("description") != null) inc.setDescription((String)body.get("description"));
        if (body.get("date") != null) inc.setDate(LocalDate.parse((String)body.get("date")));
        incomes.save(inc);
        return ResponseEntity.ok(inc);
    }

    @DeleteMapping("/incomes/{id}")
    public ResponseEntity<?> deleteIncome(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        Income inc = incomes.findById(id).orElse(null);
        if (inc == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(inc.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");
        incomes.deleteById(id);
        return ResponseEntity.ok(Map.of("status","deleted"));
    }

    @PostMapping("/incomes")
    public ResponseEntity<?> createIncome(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String,Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Double amount = body.get("amount") == null ? 0.0 : Double.valueOf(body.get("amount").toString());
        String description = (String) body.get("description");
        String dateStr = (String) body.get("date");
        LocalDate date = dateStr == null ? LocalDate.now() : LocalDate.parse(dateStr);

        Income inc = new Income(u.getId(), amount, description, date);
        Income saved = incomes.save(inc);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/expenses")
    public ResponseEntity<?> listExpenses(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        List<Expense> exp = expenses.findByOwnerId(u.getId());
        return ResponseEntity.ok(exp);
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<?> updateExpense(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id, @RequestBody Map<String,Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        Expense ex = expenses.findById(id).orElse(null);
        if (ex == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(ex.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");
        if (body.get("amount") != null) ex.setAmount(Double.valueOf(body.get("amount").toString()));
        if (body.get("description") != null) ex.setDescription((String)body.get("description"));
        if (body.get("date") != null) ex.setDate(LocalDate.parse((String)body.get("date")));
        if (body.get("category") != null) ex.setCategory((String)body.get("category"));
        expenses.save(ex);
        return ResponseEntity.ok(ex);
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<?> deleteExpense(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        Expense ex = expenses.findById(id).orElse(null);
        if (ex == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(ex.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");
        expenses.deleteById(id);
        return ResponseEntity.ok(Map.of("status","deleted"));
    }

    @PostMapping("/expenses")
    public ResponseEntity<?> createExpense(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String,Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        Double amount = body.get("amount") == null ? 0.0 : Double.valueOf(body.get("amount").toString());
        String description = (String) body.get("description");
        String dateStr = (String) body.get("date");
        LocalDate date = dateStr == null ? LocalDate.now() : LocalDate.parse(dateStr);
        String category = (String) body.getOrDefault("category", "Other");

        // If the current user is a group owner, use transactional financeService to create splits
        if ("group".equalsIgnoreCase(u.getAccountType())) {
            Map<String,Object> res = financeService.createSplitExpense(u, amount, description, date);
            return ResponseEntity.ok(res);
        }

        // individual account: single expense
        Expense e = new Expense(u.getId(), amount, description, date, category);
        Expense saved = expenses.save(e);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/investments")
    public ResponseEntity<?> listInvestments(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        List<Investment> inv = investments.findByOwnerId(u.getId());
        return ResponseEntity.ok(inv);
    }

    @PutMapping("/investments/{id}")
    public ResponseEntity<?> updateInvestment(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id, @RequestBody Map<String,Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        Investment iv = investments.findById(id).orElse(null);
        if (iv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(iv.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");
        if (body.get("amount") != null) iv.setAmount(Double.valueOf(body.get("amount").toString()));
        if (body.get("description") != null) iv.setDescription((String)body.get("description"));
        if (body.get("date") != null) iv.setDate(LocalDate.parse((String)body.get("date")));
        investments.save(iv);
        return ResponseEntity.ok(iv);
    }

    @DeleteMapping("/investments/{id}")
    public ResponseEntity<?> deleteInvestment(@RequestHeader(value = "Authorization", required = false) String authHeader, @PathVariable Long id) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        Investment iv = investments.findById(id).orElse(null);
        if (iv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        if (!u.getId().equals(iv.getOwnerId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not owner");
        investments.deleteById(id);
        return ResponseEntity.ok(Map.of("status","deleted"));
    }

    @PostMapping("/investments")
    public ResponseEntity<?> createInvestment(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String,Object> body) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        Double amount = body.get("amount") == null ? 0.0 : Double.valueOf(body.get("amount").toString());
        String description = (String) body.get("description");
        String dateStr = (String) body.get("date");
        LocalDate date = dateStr == null ? LocalDate.now() : LocalDate.parse(dateStr);

        Investment iv = new Investment(u.getId(), amount, description, date);
        Investment saved = investments.save(iv);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/health-score")
    public ResponseEntity<?> getHealthScore(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        List<Income> inc = incomes.findByOwnerId(u.getId());
        List<Expense> exp = expenses.findByOwnerId(u.getId());
        List<Investment> inv = investments.findByOwnerId(u.getId());

        double profileMonthly = u.getMonthlyIncome() == null ? 0 : u.getMonthlyIncome();
        double membersMonthly = usersRepo.findByOwnerId(u.getId()).stream().mapToDouble(m -> m.getMonthlyIncome() == null ? 0 : m.getMonthlyIncome()).sum();
        double incomesSum = inc.stream().mapToDouble(i -> i.getAmount() == null ? 0 : i.getAmount()).sum();
        double totalIncome = profileMonthly + membersMonthly + incomesSum;
        double totalExpense = exp.stream().mapToDouble(e -> e.getAmount() == null ? 0 : e.getAmount()).sum();
        double totalInvest = inv.stream().mapToDouble(iv -> iv.getAmount() == null ? 0 : iv.getAmount()).sum();

        // Calculate health score (0-100)
        double savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
        double investmentRate = totalIncome > 0 ? (totalInvest / totalIncome) * 100 : 0;
        double expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;

        // Score calculation: 40% savings rate + 30% investment rate + 30% expense control
        double score = (savingsRate * 0.4) + (investmentRate * 0.3) + (Math.max(0, 100 - expenseRatio) * 0.3);
        score = Math.min(100, Math.max(0, score));

        String rating;
        if (score >= 80) rating = "Excellent";
        else if (score >= 60) rating = "Good";
        else if (score >= 40) rating = "Fair";
        else rating = "Needs Improvement";

        Map<String, Object> healthScore = new HashMap<>();
        healthScore.put("score", Math.round(score * 10) / 10.0);
        healthScore.put("rating", rating);
        healthScore.put("savingsRate", Math.round(savingsRate * 10) / 10.0);
        healthScore.put("investmentRate", Math.round(investmentRate * 10) / 10.0);
        healthScore.put("expenseRatio", Math.round(expenseRatio * 10) / 10.0);
        healthScore.put("totalIncome", totalIncome);
        healthScore.put("totalExpense", totalExpense);
        healthScore.put("totalInvestment", totalInvest);

        return ResponseEntity.ok(healthScore);
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<?> getCategoryBreakdown(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        List<Expense> exp = expenses.findByOwnerId(u.getId());
        Map<String, Double> categoryMap = new HashMap<>();

        for (Expense e : exp) {
            String cat = e.getCategory() == null || e.getCategory().isEmpty() ? "Other" : e.getCategory();
            double amount = e.getAmount() == null ? 0 : e.getAmount();
            categoryMap.put(cat, categoryMap.getOrDefault(cat, 0.0) + amount);
        }

        return ResponseEntity.ok(categoryMap);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<?> exportCSV(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        List<Income> inc = incomes.findByOwnerId(u.getId());
        List<Expense> exp = expenses.findByOwnerId(u.getId());
        List<Investment> inv = investments.findByOwnerId(u.getId());

        StringBuilder csv = new StringBuilder();
        csv.append("Type,Date,Description,Amount,Category\n");

        for (Income i : inc) {
            csv.append("Income,")
               .append(i.getDate() == null ? "" : i.getDate())
               .append(",\"")
               .append(i.getDescription() == null ? "" : i.getDescription().replace("\"", "\"\""))
               .append("\",")
               .append(i.getAmount() == null ? 0 : i.getAmount())
               .append(",\n");
        }

        for (Expense e : exp) {
            csv.append("Expense,")
               .append(e.getDate() == null ? "" : e.getDate())
               .append(",\"")
               .append(e.getDescription() == null ? "" : e.getDescription().replace("\"", "\"\""))
               .append("\",")
               .append(e.getAmount() == null ? 0 : e.getAmount())
               .append(",")
               .append(e.getCategory() == null ? "Other" : e.getCategory())
               .append("\n");
        }

        for (Investment iv : inv) {
            csv.append("Investment,")
               .append(iv.getDate() == null ? "" : iv.getDate())
               .append(",\"")
               .append(iv.getDescription() == null ? "" : iv.getDescription().replace("\"", "\"\""))
               .append("\",")
               .append(iv.getAmount() == null ? 0 : iv.getAmount())
               .append(",\n");
        }

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=spendwise_export.csv")
                .body(csv.toString());
    }

    @GetMapping("/daily-spending")
    public ResponseEntity<?> getDailySpending(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfile u = requireUser(authHeader);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");

        List<Expense> exp = expenses.findByOwnerId(u.getId());
        Map<String, Double> dailyMap = new HashMap<>();

        for (Expense e : exp) {
            if (e.getDate() != null) {
                String dateKey = e.getDate().toString();
                double amount = e.getAmount() == null ? 0 : e.getAmount();
                dailyMap.put(dateKey, dailyMap.getOrDefault(dateKey, 0.0) + amount);
            }
        }

        return ResponseEntity.ok(dailyMap);
    }
}
