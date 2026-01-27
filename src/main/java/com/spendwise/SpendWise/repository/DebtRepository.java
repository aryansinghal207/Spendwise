package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Debt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {
    List<Debt> findByFromUserId(Long fromUserId);
    List<Debt> findByToUserId(Long toUserId);
    
    @Query("SELECT d FROM Debt d WHERE (d.fromUserId = ?1 OR d.toUserId = ?1) AND d.status = 'pending'")
    List<Debt> findPendingDebtsByUserId(Long userId);
}
