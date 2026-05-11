package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByOwnerId(Long ownerId);

    @Query("select coalesce(sum(i.amount), 0) from Investment i where i.ownerId = :ownerId")
    double sumAmountByOwnerId(@Param("ownerId") Long ownerId);
}
