package com.dahub.application.dto;

import java.util.UUID;

public class TicketAttachmentDTO {

    private UUID id;
    private String requirementLabel;
    private String fileName;
    private String filePath;
    private String mimeType;
    private Long fileSize;

    public TicketAttachmentDTO() {}

    public TicketAttachmentDTO(UUID id, String requirementLabel, String fileName, String filePath, String mimeType, Long fileSize) {
        this.id = id;
        this.requirementLabel = requirementLabel;
        this.fileName = fileName;
        this.filePath = filePath;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
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
}
