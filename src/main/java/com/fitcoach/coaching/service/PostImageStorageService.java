package com.fitcoach.coaching.service;

import com.fitcoach.coaching.exception.InvalidPostImageException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stockage local des images jointes aux publications, sous
 * {@code app.uploads.dir/posts}.
 *
 * <p>A la difference de l'avatar, un coach peut publier plusieurs images : le
 * nom de fichier est toujours un nouvel UUID, rien n'est jamais ecrase.
 */
@Service
public class PostImageStorageService {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Map<String, String> ALLOWED_TYPES =
            Map.of("image/png", "png", "image/jpeg", "jpg", "image/webp", "webp");

    private final Path root;

    public PostImageStorageService(@Value("${app.uploads.dir}") String uploadsDir) {
        this.root = Path.of(uploadsDir, "posts").toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de creer le dossier d'upload " + root, e);
        }
    }

    /** @return le chemin public relatif du fichier stocke, ex. {@code /uploads/posts/<uuid>.jpg}. */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidPostImageException("Aucun fichier fourni.");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new InvalidPostImageException("L'image ne doit pas depasser 5 Mo.");
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new InvalidPostImageException("Format d'image non supporte (png, jpg, webp uniquement).");
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path target = root.resolve(filename);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Ecriture de l'image impossible", e);
        }
        return "/uploads/posts/" + filename;
    }
}
