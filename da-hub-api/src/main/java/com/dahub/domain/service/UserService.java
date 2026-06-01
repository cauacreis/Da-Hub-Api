package com.dahub.domain.service;

import com.dahub.application.dto.UserRegistrationDTO;
import com.dahub.domain.entity.User;
import com.dahub.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(UserRegistrationDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }
        if (userRepository.existsByRegistrationNumber(dto.getRegistrationNumber())) {
            throw new IllegalArgumentException("Matrícula já cadastrada");
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .registrationNumber(dto.getRegistrationNumber())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(com.dahub.domain.entity.enums.Role.STUDENT)
                .build();

        return userRepository.save(user);
    }
}
