package com.fitcoach.coaching.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.coaching.dto.PostRequest;
import com.fitcoach.coaching.dto.PostResponse;
import com.fitcoach.coaching.service.CoachPostService;
import com.fitcoach.coaching.service.PostImageStorageService;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.CacheControl;
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

    /** Images immuables (nom = UUID) mais privees : cache navigateur uniquement. */
    private static final Duration IMAGE_CACHE = Duration.ofHours(1);

    private final CoachPostService coachPostService;
    private final PostImageStorageService postImageStorageService;

    public CoachPostController(CoachPostService coachPostService, PostImageStorageService postImageStorageService) {
        this.coachPostService = coachPostService;
        this.postImageStorageService = postImageStorageService;
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
        return coachPostService
                .loadImage(coachId, filename, AuthenticatedUsers.id(authentication))
                .map(image -> ResponseEntity.ok()
                        .contentType(image.mediaType())
                        .cacheControl(CacheControl.maxAge(IMAGE_CACHE).cachePrivate())
                        .body(new FileSystemResource(image.path())))
                .orElseGet(() -> ResponseEntity.notFound().build());
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
