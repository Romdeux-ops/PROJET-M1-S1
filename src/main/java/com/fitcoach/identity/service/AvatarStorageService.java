package com.fitcoach.identity.service;

import com.fitcoach.identity.exception.InvalidAvatarException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stockage local des photos de profil sous {@code app.uploads.dir/avatars}.
 *
 * <p>Une seule photo par utilisateur : tout fichier precedent est efface avant
 * d'ecrire le nouveau, quelle que soit son extension d'origine.
 */
@Service
public class AvatarStorageService {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Map<String, String> ALLOWED_TYPES =
            Map.of("image/png", "png", "image/jpeg", "jpg", "image/webp", "webp");

    private final Path root;

    public AvatarStorageService(@Value("${app.uploads.dir}") String uploadsDir) {
        this.root = Path.of(uploadsDir, "avatars").toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de creer le dossier d'upload " + root, e);
        }
    }

    /** @return le chemin public relatif du fichier stocke, ex. {@code /uploads/avatars/<id>.jpg}. */
    public String store(UUID userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAvatarException("Aucun fichier fourni.");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new InvalidAvatarException("L'image ne doit pas depasser 5 Mo.");
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new InvalidAvatarException("Format d'image non supporte (png, jpg, webp uniquement).");
        }

        deleteExisting(userId);
        Path target = root.resolve(userId + "." + extension);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Ecriture de l'avatar impossible pour " + userId, e);
        }
        return "/uploads/avatars/" + userId + "." + extension;
    }

    private void deleteExisting(UUID userId) {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(root, userId + ".*")) {
            for (Path existing : stream) {
                Files.deleteIfExists(existing);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Nettoyage de l'ancien avatar impossible pour " + userId, e);
        }
    }
}
