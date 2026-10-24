package com.fitcoach.coaching.service;

import com.fitcoach.coaching.domain.CoachPost;
import com.fitcoach.coaching.dto.PostRequest;
import com.fitcoach.coaching.dto.PostResponse;
import com.fitcoach.coaching.exception.NotCoachClientException;
import com.fitcoach.coaching.exception.NotPostAuthorException;
import com.fitcoach.coaching.repository.CoachPostRepository;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.repository.UserRepository;
import java.util.List;
import java.util.UUID;
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
        CoachPost post = new CoachPost(coachId, request.content(), request.imageUrl());
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
        CoachPost post = coachPostRepository.findById(postId).orElseThrow();
        if (!post.getCoachId().equals(requesterId)) {
            throw new NotPostAuthorException();
        }
        coachPostRepository.delete(post);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException(userId.toString()));
    }
}
