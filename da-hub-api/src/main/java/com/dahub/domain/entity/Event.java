package com.dahub.domain.entity;

import com.dahub.domain.entity.enums.EventCategory;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "tb_events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "current_tickets_sold", nullable = false)
    private Integer currentTicketsSold = 0;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = false;

    @Column(name = "price")
    private Double price = 0.0;

    @Column(name = "max_tickets_per_user", nullable = false)
    private Integer maxTicketsPerUser = 1;

    @Column(name = "requires_attachment", nullable = false)
    private Boolean requiresAttachment = false;

    @Column(name = "attachment_requirements_json", columnDefinition = "TEXT")
    private String attachmentRequirementsJson;

    @Column(name = "banner_url", columnDefinition = "TEXT")
    private String bannerUrl;

    public Event() {}

    public Event(UUID id, String title, String description, String category, LocalDateTime eventDate, Integer maxCapacity, Integer currentTicketsSold, Boolean isPaid, Double price, Integer maxTicketsPerUser, Boolean requiresAttachment, String attachmentRequirementsJson) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.eventDate = eventDate;
        this.maxCapacity = maxCapacity;
        this.currentTicketsSold = currentTicketsSold != null ? currentTicketsSold : 0;
        this.isPaid = isPaid != null ? isPaid : false;
        this.price = price != null ? price : 0.0;
        this.maxTicketsPerUser = maxTicketsPerUser != null ? maxTicketsPerUser : 1;
        this.requiresAttachment = requiresAttachment != null ? requiresAttachment : false;
        this.attachmentRequirementsJson = attachmentRequirementsJson;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

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

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Integer getCurrentTicketsSold() { return currentTicketsSold; }
    public void setCurrentTicketsSold(Integer currentTicketsSold) { this.currentTicketsSold = currentTicketsSold; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Event event = (Event) o;
        return Objects.equals(id, event.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    public Event(UUID id, String title, String description, String category, LocalDateTime eventDate, Integer maxCapacity, Integer currentTicketsSold) {
        this(id, title, description, category, eventDate, maxCapacity, currentTicketsSold, false, 0.0, 1, false, null);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String title;
        private String description;
        private String category;
        private LocalDateTime eventDate;
        private Integer maxCapacity;
        private Integer currentTicketsSold = 0;
        private Boolean isPaid = false;
        private Double price = 0.0;
        private Integer maxTicketsPerUser = 1;
        private Boolean requiresAttachment = false;
        private String attachmentRequirementsJson;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder eventDate(LocalDateTime eventDate) { this.eventDate = eventDate; return this; }
        public Builder maxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; return this; }
        public Builder currentTicketsSold(Integer currentTicketsSold) { this.currentTicketsSold = currentTicketsSold; return this; }
        public Builder isPaid(Boolean isPaid) { this.isPaid = isPaid; return this; }
        public Builder price(Double price) { this.price = price; return this; }
        public Builder maxTicketsPerUser(Integer maxTicketsPerUser) { this.maxTicketsPerUser = maxTicketsPerUser; return this; }
        public Builder requiresAttachment(Boolean requiresAttachment) { this.requiresAttachment = requiresAttachment; return this; }
        public Builder attachmentRequirementsJson(String attachmentRequirementsJson) { this.attachmentRequirementsJson = attachmentRequirementsJson; return this; }

        public Event build() {
            return new Event(id, title, description, category, eventDate, maxCapacity, currentTicketsSold, isPaid, price, maxTicketsPerUser, requiresAttachment, attachmentRequirementsJson);
        }
    }
}
