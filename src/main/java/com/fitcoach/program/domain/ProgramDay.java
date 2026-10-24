package com.fitcoach.program.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "program_days")
public class ProgramDay {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "program_id", nullable = false)
    private UUID programId;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_rest_day", nullable = false)
    private boolean restDay;

    protected ProgramDay() {
        // JPA
    }

    public ProgramDay(UUID programId, int position, String name, boolean restDay) {
        this.programId = programId;
        this.position = position;
        this.name = name;
        this.restDay = restDay;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProgramId() {
        return programId;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isRestDay() {
        return restDay;
    }

    public void setRestDay(boolean restDay) {
        this.restDay = restDay;
    }
}
