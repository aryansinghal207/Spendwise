package com.spendwise.SpendWise.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ownerId;
    private String category; // Food, Transport, Entertainment, Bills, Shopping, Healthcare, Other
    private Double limitAmount;
    private String period; // monthly, weekly, yearly
    private Integer month; // 1-12 for monthly budgets
    private Integer year;

    public Budget() {}

    public Budget(Long ownerId, String category, Double limitAmount, String period, Integer month, Integer year) {
        this.ownerId = ownerId;
        this.category = category;
        this.limitAmount = limitAmount;
        this.period = period;
        this.month = month;
        this.year = year;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getLimitAmount() { return limitAmount; }
    public void setLimitAmount(Double limitAmount) { this.limitAmount = limitAmount; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}
