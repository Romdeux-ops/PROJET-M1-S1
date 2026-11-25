package com.fitcoach.coaching.dto;

/** Position du visiteur par rapport au coach dont il consulte le profil public. */
public enum ViewerStatus {
    /** Visiteur sans compte connecte. */
    ANONYMOUS,
    /** Le coach regarde son propre profil. */
    SELF,
    /** Un autre coach : il ne peut pas demander a etre suivi. */
    NOT_ATHLETE,
    /** Athlete sans lien (ou lien refuse / termine) : il peut demander a etre suivi. */
    NONE,
    /** L'athlete a deja envoye sa demande. */
    REQUESTED,
    /** Le coach a deja invite cet athlete : il doit accepter l'invitation. */
    INVITED,
    /** L'athlete est deja suivi par ce coach. */
    ACTIVE
}
