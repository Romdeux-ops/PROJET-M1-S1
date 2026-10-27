package com.fitcoach.coaching.service;

import com.fitcoach.coaching.domain.CoachPost;
import com.fitcoach.coaching.dto.PostRequest;
import com.fitcoach.coaching.dto.PostResponse;
import com.fitcoach.coaching.exception.CoachPostNotFoundException;
import com.fitcoach.coaching.exception.InvalidPostImageException;
import com.fitcoach.coaching.exception.NotCoachClientException;
import com.fitcoach.coaching.exception.NotPostAuthorException;
import com.fitcoach.coaching.repository.CoachPostRepository;
import com.fitcoach.coaching.service.PostImageStorageService.StoredImage;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserNotFoundException;
import com.fitcoach.identity.api.UserSummary;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Publications d'un coach sur son profil.
 *
 * <p>Regle d'acces : seul l'auteur publie ou supprime ses posts ; la lecture
 * est reservee au coach lui-meme et a ses athletes actifs (pas de mur
 * public), voir {@link CoachingService#isActiveClient}.
 */
@Service
public class CoachPostService {

    private final CoachPostRepository coachPostRepository;
    private final UserDirectory userDirectory;
    private final CoachingService coachingService;
    private final PostImageStorageService imageStorage;

    public CoachPostService(
            CoachPostRepository coachPostRepository,
            UserDirectory userDirectory,
            CoachingService coachingService,
            PostImageStorageService imageStorage) {
        this.coachPostRepository = coachPostRepository;
        this.userDirectory = userDirectory;
        this.coachingService = coachingService;
        this.imageStorage = imageStorage;
    }

    @Transactional
    public PostResponse create(UUID coachId, PostRequest request) {
        String imageUrl = request.imageUrl();
        if (imageUrl != null && !imageUrl.isBlank() && !imageStorage.isOwnUpload(coachId, imageUrl)) {
            throw new InvalidPostImageException("L'image doit provenir de l'endpoint d'upload du coach authentifie.");
        }
        CoachPost post = new CoachPost(coachId, request.content(), imageUrl);
        coachPostRepository.save(post);
        return PostResponse.from(post, findUser(coachId));
    }

    @Transactional(readOnly = true)
    public List<PostResponse> listForCoach(UUID coachId, UUID viewerId) {
        checkCanRead(coachId, viewerId);
        UserSummary coach = findUser(coachId);
        return coachPostRepository.findByCoachIdOrderByCreatedAtDesc(coachId).stream()
                .map(post -> PostResponse.from(post, coach))
                .toList();
    }

    @Transactional
    public void delete(UUID postId, UUID requesterId) {
        CoachPost post = coachPostRepository.findById(postId).orElseThrow(CoachPostNotFoundException::new);
        if (!post.getCoachId().equals(requesterId)) {
            throw new NotPostAuthorException();
        }
        coachPostRepository.delete(post);
    }

    /** Meme regle d'acces que les publications qui referencent l'image. */
    @Transactional(readOnly = true)
    public Optional<StoredImage> loadImage(UUID coachId, String filename, UUID viewerId) {
        checkCanRead(coachId, viewerId);
        return imageStorage.load(coachId, filename);
    }

    private void checkCanRead(UUID coachId, UUID viewerId) {
        if (!viewerId.equals(coachId) && !coachingService.isActiveClient(coachId, viewerId)) {
            throw new NotCoachClientException();
        }
    }

    private UserSummary findUser(UUID userId) {
        return userDirectory.findById(userId).orElseThrow(UserNotFoundException::new);
    }
}
