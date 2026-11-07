package com.fitcoach.coaching.api;

import java.util.List;
import java.util.UUID;

/**
 * Point d'entree des autres modules vers la relation coach / athlete : toute
 * lecture transverse des donnees d'un athlete par un coach doit s'appuyer ici.
 */
public interface CoachRelations {

    boolean isActiveClient(UUID coachId, UUID athleteId);

    boolean hasActiveCoach(UUID athleteId);

    List<UUID> activeAthleteIds(UUID coachId);

    List<UUID> activeCoachIds(UUID athleteId);
}
