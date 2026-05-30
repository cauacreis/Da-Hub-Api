package com.dahub.domain.repository;

import com.dahub.domain.entity.Event;
import com.dahub.domain.entity.enums.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByCategory(EventCategory category);

    List<Event> findByEventDateAfter(LocalDateTime date);

    List<Event> findByCategoryAndEventDateAfter(EventCategory category, LocalDateTime date);
}
