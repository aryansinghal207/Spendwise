package com.spendwise.SpendWise;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.spendwise.SpendWise.model.UserProfile;
import com.spendwise.SpendWise.repository.UserProfileRepository;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserProfileRepository repo;

    public DataLoader(UserProfileRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Sample data disabled for production
        // Users will sign up through the registration page
        System.out.println("UserProfiles in database: " + repo.count());
    }
}
