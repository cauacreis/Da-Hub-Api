package com.dahub.application.dto;

import com.dahub.domain.entity.enums.TicketStatus;

import java.util.UUID;

public class TicketResponseDTO {

    private UUID ticketId;
    private UUID eventId;
    private String eventTitle;
    private String userName;
    private String userRegistrationNumber;
    private String userEmail;
    private String qrCodeHash;
    private TicketStatus status;

    public TicketResponseDTO() {
    }

    public UUID getTicketId() {
        return ticketId;
    }

    public void setTicketId(UUID ticketId) {
        this.ticketId = ticketId;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserRegistrationNumber() {
        return userRegistrationNumber;
    }

    public void setUserRegistrationNumber(String userRegistrationNumber) {
        this.userRegistrationNumber = userRegistrationNumber;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getQrCodeHash() {
        return qrCodeHash;
    }

    public void setQrCodeHash(String qrCodeHash) {
        this.qrCodeHash = qrCodeHash;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
}
