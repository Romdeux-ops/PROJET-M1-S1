package com.fitcoach.matching.domain;

/** Camp d'un profil FitMatch : un athlete ne voit que des coachs, et inversement. */
public enum MatchSide {
    ATHLETE,
    COACH;

    public MatchSide opposite() {
        return this == ATHLETE ? COACH : ATHLETE;
    }
}
