package com.dahub.domain.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "tb_ticket_attachments")
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(name = "requirement_label", nullable = false)
    private String requirementLabel;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    public TicketAttachment() {}

    public TicketAttachment(UUID id, Ticket ticket, String requirementLabel, String fileName, String filePath, String mimeType, Long fileSize) {
        this.id = id;
        this.ticket = ticket;
        this.requirementLabel = requirementLabel;
        this.fileName = fileName;
        this.filePath = filePath;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public String getRequirementLabel() { return requirementLabel; }
    public void setRequirementLabel(String requirementLabel) { this.requirementLabel = requirementLabel; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}
