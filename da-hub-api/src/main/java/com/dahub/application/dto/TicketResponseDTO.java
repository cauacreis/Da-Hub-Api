package com.dahub.application.dto;

import com.dahub.domain.entity.enums.TicketStatus;

import java.util.UUID;

public class TicketResponseDTO {

    private UUID ticketId;
    private String eventTitle;
    private String userName;
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
