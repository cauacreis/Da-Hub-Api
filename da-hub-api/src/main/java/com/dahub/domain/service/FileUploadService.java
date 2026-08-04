package com.dahub.domain.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final String UPLOAD_DIR = "uploads";
    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
            "video/mp4",
            "audio/mpeg",
            "audio/wav"
    );

    public FileUploadService() {
        File folder = new File(UPLOAD_DIR);
        if (!folder.exists()) {
            folder.mkdirs();
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo enviado está vazio.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("O tamanho do arquivo excede o limite máximo permitido de 15MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido: " + contentType + ". Tipos aceitos: JPG, PNG, WEBP, PDF, MP4, MP3, WAV.");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        } else {
            if (contentType.equals("image/jpeg")) fileExtension = ".jpg";
            else if (contentType.equals("image/png")) fileExtension = ".png";
            else if (contentType.equals("application/pdf")) fileExtension = ".pdf";
            else if (contentType.equals("video/mp4")) fileExtension = ".mp4";
            else if (contentType.equals("audio/mpeg")) fileExtension = ".mp3";
            else fileExtension = ".bin";
        }

        // Prevenção contra Path Traversal: Nome randômico com UUID
        String storedFilename = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize().resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/api/files/" + storedFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Falha ao armazenar o arquivo no servidor.", ex);
        }
    }
}
