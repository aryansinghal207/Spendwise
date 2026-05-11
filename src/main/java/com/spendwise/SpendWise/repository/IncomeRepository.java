package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByOwnerId(Long ownerId);
    java.util.List<Income> findByOwnerIdOrId(Long ownerId, Long id);

    @Query("select coalesce(sum(i.amount), 0) from Income i where i.ownerId = :ownerId")
    double sumAmountByOwnerId(@Param("ownerId") Long ownerId);
}
