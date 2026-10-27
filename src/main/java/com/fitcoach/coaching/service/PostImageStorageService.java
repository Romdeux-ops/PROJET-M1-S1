package com.fitcoach.coaching.service;

import com.fitcoach.coaching.exception.InvalidPostImageException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
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

    private static final Map<String, MediaType> MEDIA_TYPES = Map.of(
            "png", MediaType.IMAGE_PNG, "jpg", MediaType.IMAGE_JPEG, "webp", MediaType.parseMediaType("image/webp"));

    /** Seuls les noms generes par {@link #store} sont acceptes : aucun separateur ni {@code ..} possible. */
    private static final Pattern STORED_FILENAME =
            Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp)$");

    private static final String RELATIVE_PREFIX = "posts/";

    private static final Map<String, byte[]> MAGIC_BYTES = Map.of(
            "png", new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47},
            "jpg", new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});

    public record StoredImage(Path path, MediaType mediaType) {}

    private final Path root;

    public PostImageStorageService(@Value("${app.uploads.dir}") String uploadsDir) {
        this.root = Path.of(uploadsDir, "posts").toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de creer le dossier d'upload " + root, e);
        }
    }

    /**
     * @return le chemin relatif stocke en base, ex. {@code posts/<coachId>/<uuid>.jpg}. Ce
     *     chemin n'est pas servi statiquement : il est lu par un endpoint authentifie qui
     *     verifie que le visiteur est le coach ou un de ses athletes actifs.
     */
    public String store(UUID coachId, MultipartFile file) {
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

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Lecture du fichier impossible", e);
        }
        if (!matchesMagicBytes(extension, content)) {
            throw new InvalidPostImageException("Le contenu du fichier ne correspond pas au format declare.");
        }

        Path coachDir = root.resolve(coachId.toString());
        try {
            Files.createDirectories(coachDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de creer le dossier d'upload " + coachDir, e);
        }
        String filename = UUID.randomUUID() + "." + extension;
        Path target = coachDir.resolve(filename);
        try {
            Files.write(target, content);
        } catch (IOException e) {
            throw new UncheckedIOException("Ecriture de l'image impossible", e);
        }
        return relativePath(coachId, filename);
    }

    /** Vrai si {@code relativePath} designe une image deposee par ce coach via {@link #store}. */
    public boolean isOwnUpload(UUID coachId, String relativePath) {
        String prefix = RELATIVE_PREFIX + coachId + "/";
        return relativePath.startsWith(prefix) && isStoredFilename(relativePath.substring(prefix.length()));
    }

    /**
     * @throws InvalidPostImageException si le nom n'a pas ete genere par {@link #store}
     */
    public Optional<StoredImage> load(UUID coachId, String filename) {
        if (!isStoredFilename(filename)) {
            throw new InvalidPostImageException("Nom d'image invalide.");
        }
        Path coachDir = root.resolve(coachId.toString());
        Path path = coachDir.resolve(filename).normalize();
        if (!path.startsWith(coachDir) || !Files.isRegularFile(path)) {
            return Optional.empty();
        }
        String extension = filename.substring(filename.lastIndexOf('.') + 1);
        return Optional.of(new StoredImage(path, MEDIA_TYPES.get(extension)));
    }

    private static boolean isStoredFilename(String filename) {
        return STORED_FILENAME.matcher(filename).matches();
    }

    private static String relativePath(UUID coachId, String filename) {
        return RELATIVE_PREFIX + coachId + "/" + filename;
    }

    private boolean matchesMagicBytes(String extension, byte[] content) {
        if ("webp".equals(extension)) {
            return content.length >= 12
                    && content[0] == 'R'
                    && content[1] == 'I'
                    && content[2] == 'F'
                    && content[3] == 'F'
                    && content[8] == 'W'
                    && content[9] == 'E'
                    && content[10] == 'B'
                    && content[11] == 'P';
        }
        byte[] magic = MAGIC_BYTES.get(extension);
        if (magic == null || content.length < magic.length) {
            return false;
        }
        for (int i = 0; i < magic.length; i++) {
            if (content[i] != magic[i]) {
                return false;
            }
        }
        return true;
    }
}
