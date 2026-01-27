package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByOwnerId(Long ownerId);
    java.util.List<Income> findByOwnerIdOrId(Long ownerId, Long id);
}
