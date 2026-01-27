package com.spendwise.SpendWise.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sample")
public class Sample {
    @GetMapping("/hello")
    public String hello() {
        return "Hello, SpendWise!";
    }
}