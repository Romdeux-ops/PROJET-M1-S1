package com.fitcoach.matching.domain;

public enum SwipeDecision {
    LIKE,
    SUPER_LIKE,
    PASS;

    public boolean isPositive() {
        return this != PASS;
    }
}
