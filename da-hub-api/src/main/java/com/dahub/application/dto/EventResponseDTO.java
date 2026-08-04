package com.dahub.application.dto;

import com.dahub.domain.entity.enums.EventCategory;

import java.time.LocalDateTime;
import java.util.UUID;

public class EventResponseDTO {

    private UUID id;
    private String title;
    private String description;
    private EventCategory category;
    private LocalDateTime eventDate;
    private Integer maxCapacity;
    private Integer currentTicketsSold;
    private Boolean isPaid;
    private Double price;
    private Integer maxTicketsPerUser;
    private Boolean requiresAttachment;
    private String attachmentRequirementsJson;

    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getMaxTicketsPerUser() { return maxTicketsPerUser; }
    public void setMaxTicketsPerUser(Integer maxTicketsPerUser) { this.maxTicketsPerUser = maxTicketsPerUser; }

    public Boolean getRequiresAttachment() { return requiresAttachment; }
    public void setRequiresAttachment(Boolean requiresAttachment) { this.requiresAttachment = requiresAttachment; }

    public String getAttachmentRequirementsJson() { return attachmentRequirementsJson; }
    public void setAttachmentRequirementsJson(String attachmentRequirementsJson) { this.attachmentRequirementsJson = attachmentRequirementsJson; }

    public EventResponseDTO() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EventCategory getCategory() {
        return category;
    }

    public void setCategory(EventCategory category) {
        this.category = category;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public Integer getCurrentTicketsSold() {
        return currentTicketsSold;
    }

    public void setCurrentTicketsSold(Integer currentTicketsSold) {
        this.currentTicketsSold = currentTicketsSold;
    }
}
