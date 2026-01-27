package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByOwnerId(Long ownerId);
    List<Budget> findByOwnerIdAndCategoryAndMonthAndYear(Long ownerId, String category, Integer month, Integer year);
}
