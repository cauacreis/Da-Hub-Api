package com.dahub.infrastructure.config;

import com.dahub.domain.entity.User;
import com.dahub.domain.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
            // Cria um usuário da Diretoria (VP)
            User diretor = new User();
            diretor.setName("Membro da Diretoria");
            diretor.setEmail("diretoria@dahub.dev");
            diretor.setPassword(passwordEncoder.encode("admin"));
            diretor.setRegistrationNumber("00000");
            diretor.setRole("VP");
            userRepository.save(diretor);

            // Cria um usuário Aluno Padrão (STUDENT)
            User aluno = new User();
            aluno.setName("Aluno Padrão");
            aluno.setEmail("aluno@dahub.dev");
            aluno.setPassword(passwordEncoder.encode("123"));
            aluno.setRegistrationNumber("55555");
            aluno.setRole("STUDENT");
            userRepository.save(aluno);

            System.out.println("====== USUÁRIOS DE TESTE CRIADOS ======");
            System.out.println("Diretoria -> Email: diretoria@dahub.dev | Senha: admin");
            System.out.println("Aluno     -> Email: aluno@dahub.dev | Senha: 123");
            System.out.println("=======================================");
        }
    }
}
