package com.spendwise.SpendWise.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private Double monthlyIncome;
    @JsonIgnore
    private String password;
    private String accountType; // "individual" or "group"
    private Long ownerId; // null for root owners; points to owner user id for group members

    public UserProfile() {
    }

    public UserProfile(String name, String email, Double monthlyIncome) {
        this.name = name;
        this.email = email;
        this.monthlyIncome = monthlyIncome;
    }

    public UserProfile(String name, String email, Double monthlyIncome, String password, String accountType) {
        this.name = name;
        this.email = email;
        this.monthlyIncome = monthlyIncome;
        this.password = password;
        this.accountType = accountType;
    }

    public UserProfile(String name, String email, Double monthlyIncome, String password, String accountType, Long ownerId) {
        this.name = name;
        this.email = email;
        this.monthlyIncome = monthlyIncome;
        this.password = password;
        this.accountType = accountType;
        this.ownerId = ownerId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
