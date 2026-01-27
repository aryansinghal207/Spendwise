package com.spendwise.SpendWise.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.model}")
    private String geminiModel;

    private final WebClient webClient;

    public ChatController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question is required"));
        }

        try {
            // Build the Gemini request with proper format
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", question);
            
            Map<String, Object> contentItem = new HashMap<>();
            contentItem.put("parts", List.of(textPart));
            
            Map<String, Object> geminiRequest = new HashMap<>();
            geminiRequest.put("contents", List.of(contentItem));

            // Call Gemini API with API key as query parameter
            String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;
            
            Mono<Map> responseMono = webClient.post()
                .uri(urlWithKey)
                .header("Content-Type", "application/json")
                .bodyValue(geminiRequest)
                .retrieve()
                .bodyToMono(Map.class);

            Map<String, Object> geminiResponse = responseMono.block();
            
            if (geminiResponse != null && geminiResponse.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) geminiResponse.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> responseContent = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) responseContent.get("parts");
                    if (!parts.isEmpty()) {
                        String answer = (String) parts.get(0).get("text");
                        
                        return ResponseEntity.ok(Map.of(
                            "answer", answer.trim(),
                            "source", "gemini"
                        ));
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get response from AI"));

        } catch (Exception e) {
            e.printStackTrace();
            
            // Check if it's a rate limit error (429)
            String errorMsg = e.getMessage();
            if (errorMsg != null && (errorMsg.contains("429") || errorMsg.contains("Too Many Requests"))) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Please wait a few minutes and try again."));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error communicating with AI: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        boolean apiKeyConfigured = geminiApiKey != null && 
                                   !geminiApiKey.isEmpty() && 
                                   !geminiApiKey.equals("your-api-key-here");
        
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "apiKeyConfigured", apiKeyConfigured,
            "model", geminiModel,
            "provider", "Google Gemini"
        ));
    }
}
