package com.fitcoach.coaching.service;

import com.fitcoach.coaching.domain.CoachPost;
import com.fitcoach.coaching.dto.PostRequest;
import com.fitcoach.coaching.dto.PostResponse;
import com.fitcoach.coaching.exception.CoachPostNotFoundException;
import com.fitcoach.coaching.exception.InvalidPostImageException;
import com.fitcoach.coaching.exception.NotCoachClientException;
import com.fitcoach.coaching.exception.NotPostAuthorException;
import com.fitcoach.coaching.repository.CoachPostRepository;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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

    private static final Pattern OWN_UPLOAD_PATH =
            Pattern.compile("^posts/[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}\\.(png|jpg|webp)$");

    private final CoachPostRepository coachPostRepository;
    private final UserRepository userRepository;
    private final CoachingService coachingService;

    public CoachPostService(
            CoachPostRepository coachPostRepository, UserRepository userRepository, CoachingService coachingService) {
        this.coachPostRepository = coachPostRepository;
        this.userRepository = userRepository;
        this.coachingService = coachingService;
    }

    @Transactional
    public PostResponse create(UUID coachId, PostRequest request) {
        String imageUrl = request.imageUrl();
        if (imageUrl != null && !imageUrl.isBlank()) {
            String expectedPrefix = "posts/" + coachId + "/";
            if (!imageUrl.startsWith(expectedPrefix) || !OWN_UPLOAD_PATH.matcher(imageUrl).matches()) {
                throw new InvalidPostImageException(
                        "L'image doit provenir de l'endpoint d'upload du coach authentifie.");
            }
        }
        CoachPost post = new CoachPost(coachId, request.content(), imageUrl);
        coachPostRepository.save(post);
        return PostResponse.from(post, findUser(coachId));
    }

    @Transactional(readOnly = true)
    public List<PostResponse> listForCoach(UUID coachId, UUID viewerId) {
        if (!viewerId.equals(coachId) && !coachingService.isActiveClient(coachId, viewerId)) {
            throw new NotCoachClientException();
        }
        User coach = findUser(coachId);
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

    private User findUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException(userId.toString()));
    }
}
