package com.spendwise.SpendWise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.spendwise.SpendWise.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
	UserProfile findByEmail(String email);
	java.util.List<UserProfile> findAllByEmail(String email);
	UserProfile findByEmailAndAccountType(String email, String accountType);
	boolean existsByEmailAndAccountType(String email, String accountType);
	long countByEmail(String email);

	java.util.List<UserProfile> findByOwnerId(Long ownerId);

	java.util.List<UserProfile> findByOwnerIdOrId(Long ownerId, Long id);

	@Query("select coalesce(sum(u.monthlyIncome), 0) from UserProfile u where u.ownerId = :ownerId")
	double sumMonthlyIncomeByOwnerId(@Param("ownerId") Long ownerId);
}
