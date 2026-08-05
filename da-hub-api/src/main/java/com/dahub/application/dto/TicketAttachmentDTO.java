package com.dahub.application.dto;

import java.util.UUID;

public class TicketAttachmentDTO {

    private UUID id;
    private String requirementLabel;
    private String fileName;
    private String filePath;
    private String mimeType;
    private Long fileSize;
    private String description;

    public TicketAttachmentDTO() {}

    public TicketAttachmentDTO(UUID id, String requirementLabel, String fileName, String filePath, String mimeType, Long fileSize, String description) {
        this.id = id;
        this.requirementLabel = requirementLabel;
        this.fileName = fileName;
        this.filePath = filePath;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.description = description;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
