package com.dahub.domain.entity;

import com.dahub.domain.entity.enums.EventCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventCategory category;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "current_tickets_sold", nullable = false)
    @Builder.Default
    private Integer currentTicketsSold = 0;
}
