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
        if (repo.count() == 0) {
            repo.save(new UserProfile("Alice", "alice@example.com", 5000.0));
            repo.save(new UserProfile("Bob", "bob@example.com", 3000.0));
            System.out.println("Inserted sample UserProfiles: " + repo.count());
        } else {
            System.out.println("UserProfiles already present: " + repo.count());
        }
    }
}
