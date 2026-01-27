package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByOwnerId(Long ownerId);
}
