package com.resumeanalyzer.backend.service;

import com.resumeanalyzer.backend.model.Resume;
import com.resumeanalyzer.backend.repository.ResumeRepository;
import org.apache.tika.Tika;
import com.resumeanalyzer.backend.model.User;
import com.resumeanalyzer.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.apache.tika.Tika;
import com.resumeanalyzer.backend.model.User;
import com.resumeanalyzer.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private AIService aiService;

    public Resume uploadAndAnalyze(MultipartFile file) throws Exception {
        Tika tika = new Tika();
        String extractedText = tika.parseToString(file.getInputStream());

        String aiAnalysisResult = aiService.analyzeResume(extractedText);

        Resume resume = new Resume();
        resume.setFilename(file.getOriginalFilename());
        resume.setRawText(extractedText);
        resume.setAnalysisResult(aiAnalysisResult);

        // Security Context attachment
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            java.util.Optional<User> userOpt = userRepository.findByUsername(username);
            userOpt.ifPresent(resume::setUser);
        }

        return resumeRepository.save(resume);
    }

    @Autowired
    private UserRepository userRepository;

    public List<Resume> getAllResumes() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            java.util.Optional<User> userOpt = userRepository.findByUsername(username);
            if(userOpt.isPresent()) {
                // If it were a production app, we would write a custom query in ResumeRepository: findByUser(User user)
                // For simplicity, we just filter the general list or we can write the query.
                return resumeRepository.findAll().stream().filter(r -> r.getUser() != null && r.getUser().getId().equals(userOpt.get().getId())).toList();
            }
        }
        return List.of();
    }

    public Optional<Resume> getResumeById(Long id) {
        return resumeRepository.findById(id);
    }
}
