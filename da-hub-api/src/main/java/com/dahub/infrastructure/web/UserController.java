package com.dahub.infrastructure.web;

import com.dahub.application.dto.UserRegistrationDTO;
import com.dahub.domain.entity.User;
import com.dahub.domain.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public User registerUser(@Valid @RequestBody UserRegistrationDTO dto) {
        return userService.registerUser(dto);
    }
}
