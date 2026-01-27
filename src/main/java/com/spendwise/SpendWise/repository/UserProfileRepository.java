package com.spendwise.SpendWise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.spendwise.SpendWise.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
	UserProfile findByEmail(String email);

	java.util.List<UserProfile> findByOwnerId(Long ownerId);

	java.util.List<UserProfile> findByOwnerIdOrId(Long ownerId, Long id);
}
