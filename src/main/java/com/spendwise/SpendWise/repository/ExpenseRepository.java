package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByOwnerId(Long ownerId);

    @Query("select coalesce(sum(e.amount), 0) from Expense e where e.ownerId = :ownerId")
    double sumAmountByOwnerId(@Param("ownerId") Long ownerId);
}
