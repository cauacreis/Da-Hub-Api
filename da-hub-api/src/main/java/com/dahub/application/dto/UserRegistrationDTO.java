package com.dahub.application.dto;

import com.dahub.domain.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserRegistrationDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String name;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "O e-mail deve ser válido")
    private String email;

    @NotBlank(message = "A matrícula é obrigatória")
    private String registrationNumber;

    @NotBlank(message = "A senha é obrigatória")
    private String password;

    @NotNull(message = "O perfil (role) é obrigatório")
    private Role role;

    public UserRegistrationDTO() {}

    public UserRegistrationDTO(String name, String email, String registrationNumber, String password, Role role) {
        this.name = name;
        this.email = email;
        this.registrationNumber = registrationNumber;
        this.password = password;
        this.role = role;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String email;
        private String registrationNumber;
        private String password;
        private Role role;

        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder role(Role role) { this.role = role; return this; }

        public UserRegistrationDTO build() {
            return new UserRegistrationDTO(name, email, registrationNumber, password, role);
        }
    }
}
