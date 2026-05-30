# DA Hub API

Plataforma de Gestão B2B — Backend Spring Boot

## Stack
- Java 21
- Spring Boot 3.3
- Spring Data JPA + PostgreSQL 15
- Spring Security (Stateless / JWT — futuro)
- Lombok
- Maven

## Estrutura DDD

```
src/main/java/com/dahub/
├── DaHubApiApplication.java
├── domain/
│   ├── entity/          # Entidades JPA
│   ├── repository/      # Interfaces de repositório
│   ├── service/         # Serviços de domínio
│   └── valueobject/     # Value Objects
├── application/
│   ├── usecase/         # Casos de uso
│   ├── dto/             # Request / Response DTOs
│   └── mapper/          # Conversão domain ↔ dto
└── infrastructure/
    ├── config/          # SecurityConfig, CorsConfig, etc.
    ├── persistence/     # Implementações JPA dos repositórios
    └── web/             # Controllers REST, Exception Handlers
```

## Como subir o banco (Docker)

```bash
# Na raiz do projeto (onde está o docker-compose.yml):
docker compose up -d

# Verificar se está saudável:
docker compose ps

# Parar o banco:
docker compose down
```

## Como rodar a API

```bash
cd da-hub-api
mvn spring-boot:run
```

A API sobe em: `http://localhost:8080/api`
