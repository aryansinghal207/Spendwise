package com.spendwise.SpendWise.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "debts")
public class Debt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fromUserId; // who owes
    private Long toUserId; // who is owed
    private Double amount;
    private String description;
    private LocalDate date;
    private String status; // pending, settled
    private Long relatedExpenseId; // optional link to expense

    public Debt() {}

    public Debt(Long fromUserId, Long toUserId, Double amount, String description, LocalDate date) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.status = "pending";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getFromUserId() { return fromUserId; }
    public void setFromUserId(Long fromUserId) { this.fromUserId = fromUserId; }
    public Long getToUserId() { return toUserId; }
    public void setToUserId(Long toUserId) { this.toUserId = toUserId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getRelatedExpenseId() { return relatedExpenseId; }
    public void setRelatedExpenseId(Long relatedExpenseId) { this.relatedExpenseId = relatedExpenseId; }
}
