package com.fitcoach.common.web;

import com.fitcoach.catalog.exception.ExerciseNotFoundException;
import com.fitcoach.catalog.exception.InvalidExerciseReferenceException;
import com.fitcoach.catalog.exception.NotCatalogManagerException;
import com.fitcoach.coaching.exception.InvalidAthleteException;
import com.fitcoach.coaching.exception.InvalidPostImageException;
import com.fitcoach.coaching.exception.NotCoachClientException;
import com.fitcoach.coaching.exception.NotCoachException;
import com.fitcoach.coaching.exception.NotPostAuthorException;
import com.fitcoach.identity.exception.AccountDisabledException;
import com.fitcoach.identity.exception.EmailAlreadyUsedException;
import com.fitcoach.identity.exception.InvalidAvatarException;
import com.fitcoach.identity.exception.InvalidCredentialsException;
import com.fitcoach.program.exception.CannotRateOwnProgramException;
import com.fitcoach.program.exception.NotProgramOwnerException;
import com.fitcoach.program.exception.ProgramDayNotFoundException;
import com.fitcoach.program.exception.ProgramExerciseNotFoundException;
import com.fitcoach.program.exception.ProgramNotFoundException;
import com.fitcoach.planning.exception.NotValidatingCoachException;
import com.fitcoach.planning.exception.ScheduledSessionNotFoundException;
import com.fitcoach.program.exception.ProgramNotPublicException;
import com.fitcoach.training.exception.InvalidSessionExerciseException;
import com.fitcoach.training.exception.SessionNotFoundException;
import com.fitcoach.training.exception.SessionSetNotFoundException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Traduit les exceptions metier en {@code ProblemDetail} (RFC 9457), format
 * attendu par le client frontend (frontend/src/lib/api/errors.ts).
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ProblemDetail handleEmailAlreadyUsed(EmailAlreadyUsedException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ProblemDetail handleInvalidCredentials(InvalidCredentialsException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AccountDisabledException.class)
    public ProblemDetail handleAccountDisabled(AccountDisabledException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(InvalidAvatarException.class)
    public ProblemDetail handleInvalidAvatar(InvalidAvatarException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ProblemDetail handleUserNotFound(UsernameNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Utilisateur introuvable.");
    }

    @ExceptionHandler(NotCoachClientException.class)
    public ProblemDetail handleNotCoachClient(NotCoachClientException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(NotCoachException.class)
    public ProblemDetail handleNotCoach(NotCoachException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(NotPostAuthorException.class)
    public ProblemDetail handleNotPostAuthor(NotPostAuthorException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(InvalidAthleteException.class)
    public ProblemDetail handleInvalidAthlete(InvalidAthleteException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidPostImageException.class)
    public ProblemDetail handleInvalidPostImage(InvalidPostImageException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ExerciseNotFoundException.class)
    public ProblemDetail handleExerciseNotFound(ExerciseNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(NotCatalogManagerException.class)
    public ProblemDetail handleNotCatalogManager(NotCatalogManagerException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(InvalidExerciseReferenceException.class)
    public ProblemDetail handleInvalidExerciseReference(InvalidExerciseReferenceException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ProgramNotFoundException.class)
    public ProblemDetail handleProgramNotFound(ProgramNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(NotProgramOwnerException.class)
    public ProblemDetail handleNotProgramOwner(NotProgramOwnerException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(ProgramDayNotFoundException.class)
    public ProblemDetail handleProgramDayNotFound(ProgramDayNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ProgramExerciseNotFoundException.class)
    public ProblemDetail handleProgramExerciseNotFound(ProgramExerciseNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(CannotRateOwnProgramException.class)
    public ProblemDetail handleCannotRateOwnProgram(CannotRateOwnProgramException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ProgramNotPublicException.class)
    public ProblemDetail handleProgramNotPublic(ProgramNotPublicException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(SessionNotFoundException.class)
    public ProblemDetail handleSessionNotFound(SessionNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(SessionSetNotFoundException.class)
    public ProblemDetail handleSessionSetNotFound(SessionSetNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidSessionExerciseException.class)
    public ProblemDetail handleInvalidSessionExercise(InvalidSessionExerciseException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ScheduledSessionNotFoundException.class)
    public ProblemDetail handleScheduledSessionNotFound(ScheduledSessionNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(NotValidatingCoachException.class)
    public ProblemDetail handleNotValidatingCoach(NotValidatingCoachException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "Cette ressource est utilisee ailleurs et ne peut pas etre supprimee.");
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Certaines donnees sont invalides.");
        problem.setProperty("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }
}
