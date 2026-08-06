package com.dahub.infrastructure.config;

import com.dahub.domain.entity.User;
import com.dahub.domain.entity.enums.Role;
import com.dahub.domain.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicializa dados padrões (como as contas de teste de Diretoria e Aluno)
 * se o banco de dados estiver vazio ao iniciar o servidor na nuvem ou em dev.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // 1. Conta do Administrador / Diretoria
            User admin = new User(
                    null,
                    "Diretoria DA Hub",
                    "diretoria@dahub.dev",
                    "1001",
                    passwordEncoder.encode("admin"),
                    Role.DIRECTOR
            );
            userRepository.save(admin);

            // 2. Conta do Aluno / Usuário Comum
            User student = new User(
                    null,
                    "Aluno de Teste",
                    "aluno@dahub.dev",
                    "2001",
                    passwordEncoder.encode("123"),
                    Role.STUDENT
            );
            userRepository.save(student);

            System.out.println("✅ [DA Hub] Contas padrão inicializadas no banco de dados:");
            System.out.println("   -> Diretoria: diretoria@dahub.dev | Senha: admin");
            System.out.println("   -> Aluno:     aluno@dahub.dev     | Senha: 123");
        }
    }
}
