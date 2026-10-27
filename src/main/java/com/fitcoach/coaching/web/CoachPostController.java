package com.fitcoach.coaching.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.coaching.dto.PostRequest;
import com.fitcoach.coaching.dto.PostResponse;
import com.fitcoach.coaching.exception.NotCoachClientException;
import com.fitcoach.coaching.service.CoachPostService;
import com.fitcoach.coaching.service.CoachingService;
import com.fitcoach.coaching.service.PostImageStorageService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/coaching/posts")
public class CoachPostController {

    private final CoachPostService coachPostService;
    private final PostImageStorageService postImageStorageService;
    private final CoachingService coachingService;

    public CoachPostController(
            CoachPostService coachPostService,
            PostImageStorageService postImageStorageService,
            CoachingService coachingService) {
        this.coachPostService = coachPostService;
        this.postImageStorageService = postImageStorageService;
        this.coachingService = coachingService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<PostResponse> create(Authentication authentication, @Valid @RequestBody PostRequest request) {
        PostResponse post = coachPostService.create(AuthenticatedUsers.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PostMapping(path = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('COACH')")
    public ImageResponse uploadImage(Authentication authentication, @RequestParam("file") MultipartFile file) {
        UUID coachId = AuthenticatedUsers.id(authentication);
        return new ImageResponse(postImageStorageService.store(coachId, file));
    }

    @GetMapping("/images/{coachId}/{filename}")
    public ResponseEntity<FileSystemResource> getImage(
            Authentication authentication, @PathVariable UUID coachId, @PathVariable String filename) {
        UUID viewerId = AuthenticatedUsers.id(authentication);
        if (!viewerId.equals(coachId) && !coachingService.isActiveClient(coachId, viewerId)) {
            throw new NotCoachClientException();
        }
        var path = postImageStorageService.resolve("posts/" + coachId + "/" + filename);
        if (!Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }
        String contentType;
        try {
            contentType = Files.probeContentType(path);
        } catch (IOException e) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return ResponseEntity.ok()
                .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(path));
    }

    public record ImageResponse(String imageUrl) {}

    @GetMapping("/{coachId}")
    public List<PostResponse> listForCoach(Authentication authentication, @PathVariable UUID coachId) {
        return coachPostService.listForCoach(coachId, AuthenticatedUsers.id(authentication));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID postId) {
        coachPostService.delete(postId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }
}
