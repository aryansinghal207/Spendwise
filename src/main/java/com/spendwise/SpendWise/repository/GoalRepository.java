package com.spendwise.SpendWise.repository;

import com.spendwise.SpendWise.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByOwnerId(Long ownerId);
    List<Goal> findByOwnerIdAndStatus(Long ownerId, String status);
}
