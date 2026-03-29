package com.resumeanalyzer.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIService {

    @Value("${ai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String analyzeResume(String resumeText) {
        if (apiKey == null || apiKey.equals("your_api_key_here") || apiKey.isEmpty()) {
            return "{\"score\": 85, \"skills\": [\"Mock Skill 1\", \"Mock Skill 2\"], \"suggestions\": [\"Please configure a valid AI_API_KEY to see real results. This is a mock response.\"]}";
        }

        try {
            // Configure for Google Gemini format
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = "Analyze the following resume text. Extract a list of skills, assign an overall score out of 100, and provide 3 brief suggestions for improvement. Return ONLY a JSON object in this format: {\"score\": 85, \"skills\": [\"Java\", \"React\"], \"suggestions\": [\"Improve summary\", \"Add metrics\"]} \n\nResume Text: " + resumeText;

            Map<String, Object> requestBody = new HashMap<>();
            
            Map<String, Object> content = new HashMap<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", List.of(part));
            content.put("role", "user");

            requestBody.put("contents", List.of(content));

            // Set system instructions or simple generation config to enforce JSON
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return extractTextFromGeminiResponse(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            try {
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("score", 0);
                err.put("skills", java.util.List.of());
                err.put("suggestions", java.util.List.of("Gemini API Error: " + (e.getMessage() != null ? e.getMessage() : e.toString())));
                return objectMapper.writeValueAsString(err);
            } catch (Exception ex) {
                return "{\"score\": 0, \"skills\": [], \"suggestions\": [\"Critical serialization error.\"]}";
            }
        }
    }

    private String extractTextFromGeminiResponse(String responseJson) throws Exception {
        Map<?, ?> node = objectMapper.readValue(responseJson, Map.class);
        List<?> candidates = (List<?>) node.get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) candidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            if (parts != null && !parts.isEmpty()) {
                Map<?, ?> part = (Map<?, ?>) parts.get(0);
                return (String) part.get("text");
            }
        }
        throw new RuntimeException("Unexpected response format from AI Provider.");
    }
}
