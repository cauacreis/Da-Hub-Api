package com.dahub.domain.repository;

import com.dahub.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByRegistrationNumber(String registrationNumber);

    boolean existsByEmail(String email);

    boolean existsByRegistrationNumber(String registrationNumber);
}
