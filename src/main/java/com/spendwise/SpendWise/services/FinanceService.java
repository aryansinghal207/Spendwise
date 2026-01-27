package com.spendwise.SpendWise.services;

import com.spendwise.SpendWise.model.Expense;
import com.spendwise.SpendWise.model.Income;
import com.spendwise.SpendWise.model.Investment;
import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.ExpenseRepository;
import com.spendwise.SpendWise.repository.IncomeRepository;
import com.spendwise.SpendWise.repository.InvestmentRepository;
import com.spendwise.SpendWise.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceService {

    private final ExpenseRepository expenses;
    private final IncomeRepository incomes;
    private final InvestmentRepository investments;
    private final UserProfileRepository usersRepo;

    public FinanceService(ExpenseRepository expenses, IncomeRepository incomes, InvestmentRepository investments, UserProfileRepository usersRepo) {
        this.expenses = expenses;
        this.incomes = incomes;
        this.investments = investments;
        this.usersRepo = usersRepo;
    }

    @Transactional
    public Map<String,Object> createSplitExpense(UserProfile owner, Double amount, String description, LocalDate date) {
        Map<String,Object> resp = new HashMap<>();
        List<UserProfile> members = usersRepo.findByOwnerId(owner.getId());
        int parties = 1 + (members == null ? 0 : members.size());
        double share = parties > 0 ? amount / parties : amount;

        // create expense for owner
        Expense ownerExpense = new Expense(owner.getId(), share, description + " (split)", date);
        expenses.save(ownerExpense);

        if (members != null) {
            for (UserProfile m : members) {
                Expense me = new Expense(m.getId(), share, description + " (split)", date);
                expenses.save(me);
            }
        }

        resp.put("status","ok");
        resp.put("splitPerPerson", share);
        resp.put("parties", parties);
        return resp;
    }

}
