package com.dahub.application.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class EventCreateDTO {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String category;

    @NotNull
    @Future
    private LocalDateTime eventDate;

    @NotNull
    private Integer maxCapacity;

    private Boolean isPaid = false;
    private Double price = 0.0;
    private Integer maxTicketsPerUser = 1;
    private Boolean requiresAttachment = false;
    private String attachmentRequirementsJson;
    private String bannerUrl;

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

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

    public EventCreateDTO() {
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
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
}
