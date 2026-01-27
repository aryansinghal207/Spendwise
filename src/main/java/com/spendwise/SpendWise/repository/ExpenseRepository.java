package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByOwnerId(Long ownerId);
}
