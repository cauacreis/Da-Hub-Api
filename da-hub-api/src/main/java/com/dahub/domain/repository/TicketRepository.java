package com.dahub.domain.repository;

import com.dahub.domain.entity.Ticket;
import com.dahub.domain.entity.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    List<Ticket> findByUserId(UUID userId);

    List<Ticket> findByEventId(UUID eventId);

    List<Ticket> findByEventIdAndStatus(UUID eventId, TicketStatus status);

    Optional<Ticket> findByQrCodeHash(String qrCodeHash);

    boolean existsByQrCodeHash(String qrCodeHash);
}
