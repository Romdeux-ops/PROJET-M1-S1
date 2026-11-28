package com.fitcoach.matching.domain;

public enum TrainingMode {
    ONSITE,
    REMOTE,
    BOTH;

    public boolean allowsOnsite() {
        return this != REMOTE;
    }

    public boolean allowsRemote() {
        return this != ONSITE;
    }
}
