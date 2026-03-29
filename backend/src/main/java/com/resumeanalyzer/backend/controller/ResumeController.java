package com.resumeanalyzer.backend.controller;

import com.resumeanalyzer.backend.model.Resume;
import com.resumeanalyzer.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            Resume analyzedResume = resumeService.uploadAndAnalyze(file);
            return ResponseEntity.ok(analyzedResume);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error parsing resume: " + e.getMessage());
        }
    }

    @GetMapping("/resumes")
    public ResponseEntity<List<Resume>> getResumes() {
        return ResponseEntity.ok(resumeService.getAllResumes());
    }

    @GetMapping("/resumes/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable Long id) {
        return resumeService.getResumeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
