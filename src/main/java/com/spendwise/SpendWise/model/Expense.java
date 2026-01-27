package com.spendwise.SpendWise.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ownerId;
    private Double amount;
    private String description;
    private LocalDate date;
    private String category; // Food, Transport, Entertainment, Bills, Shopping, Healthcare, Other

    public Expense() {}

    public Expense(Long ownerId, Double amount, String description, LocalDate date) {
        this.ownerId = ownerId;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.category = "Other";
    }

    public Expense(Long ownerId, Double amount, String description, LocalDate date, String category) {
        this.ownerId = ownerId;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.category = category;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
