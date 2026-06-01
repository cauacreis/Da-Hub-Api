# DA Hub - Plataforma de Gestão B2B e Credenciamento

O **DA Hub** é uma plataforma completa e moderna para o Diretório Acadêmico, projetada para a criação de eventos, emissão de ingressos digitais e validação em catraca híbrida (Câmera/Manual). O projeto possui uma arquitetura Full-Stack com um Frontend reativo e um Backend robusto.

## 🚀 Arquitetura e Tecnologias

### 🎨 Frontend (`da-hub-web`)
O Painel da Diretoria e o Scanner foram construídos sob uma estética **Neo-Brutalista**, focando em alto contraste, sombras pesadas e legibilidade extrema, perfeito para ambientes de portaria com baixa iluminação (Dark Mode Nativo).
- **React 18** + **Vite**
- **TypeScript**
- **TailwindCSS** (Estilização Neo-Brutalista)
- **React Router DOM** (Roteamento)
- **Axios** (Integração com a API via JWT)
- **@yudiel/react-qr-scanner** (Catraca Híbrida: Leitura de Câmera)
- **Lucide React** (Ícones modernos)

### ⚙️ Backend (`da-hub-api`)
Desenvolvido focado em segurança antifraude, DDD (Domain-Driven Design) e alta performance para a emissão e validação massiva de ingressos.
- **Java 21** + **Spring Boot 3.3**
- **Spring Security + JWT** (Autenticação Stateless baseada em Roles: VP, STUDENT)
- **Spring Data JPA** + **Hibernate**
- **H2 Database** (Embutido e em memória, configurado temporariamente para dispensar a instalação do Docker)
- **Jakarta Validation** (Validação rigorosa de DTOs)

---

## 🛠️ Estrutura do Projeto

O repositório é dividido em duas pastas principais:

### 1. `da-hub-api` (Backend)
Segue os princípios do Domain-Driven Design (DDD):
- `domain/`: Entidades (User, Event, Ticket) e regras de negócio.
- `application/`: DTOs de entrada/saída e validações.
- `infrastructure/`: Controladores REST, Segurança (JWT e CORS) e configurações de banco.

### 2. `da-hub-web` (Frontend)
- `src/pages/Login.tsx`: Porta de entrada com autenticação integrada.
- `src/pages/Dashboard.tsx`: Painel principal (criação de eventos e visualização).
- `src/components/TicketModal.tsx`: O ingresso digital gerado, estilo físico, com Hash e status em tempo real.
- `src/pages/Scanner.tsx`: A **Catraca VIP**. Interface híbrida para leitura óptica por câmera ou bipagem manual de hashes de ingresso.

---

## 🚦 Como Rodar o Sistema

> **Nota sobre o Banco de Dados:** Originalmente planejado para PostgreSQL (via Docker), o projeto foi momentaneamente migrado para **H2 Database (In-Memory)**. Isso garante que qualquer desenvolvedor consiga clonar, compilar e rodar o projeto em segundos, sem a necessidade de permissões de Administrador (UAC) ou instalação de containers na máquina local. O banco será limpo a cada reinício.

### 1️⃣ Subindo o Backend (API Java)
Abra um terminal na pasta do backend e execute o Spring Boot:

```bash
cd da-hub-api
./mvnw clean package -DskipTests
java -jar target/da-hub-api-0.0.1-SNAPSHOT.jar
```
*A API subirá na porta `8080`. O banco de dados já está embutido.*

### 2️⃣ Subindo o Frontend (React)
Abra um **novo** terminal na pasta do frontend e inicie o Vite:

```bash
cd da-hub-web
npm install
npm run dev
```
*A aplicação web subirá em `http://localhost:5173`.*

---

## 📖 Como Utilizar (Guia Passo a Passo)

### 1. Criar o Primeiro Usuário (Diretoria)
Como o banco H2 é reiniciado limpo, você precisará cadastrar o seu usuário da Diretoria (VP) antes de fazer o Login. Dispare a requisição abaixo pelo PowerShell ou Insomnia/Postman:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/users/register" -Method Post -ContentType "application/json" -Body '{"name":"Membro da Diretoria","email":"diretoria@dahub.dev","password":"admin","registrationNumber":"00000","role":"VP"}'
```

### 2. Acessar o Dashboard
1. Acesse `http://localhost:5173`.
2. Faça o login com o email **diretoria@dahub.dev** e senha **admin**.
3. Clique no botão **+ NOVO EVENTO** no painel da diretoria. Crie um evento com uma data **no futuro** (o Spring Boot bloqueia eventos no passado).

### 3. Emitir Ingresso Digital
1. No painel de eventos, clique no botão amarelo **GARANTIR INGRESSO**.
2. A API criará uma reserva segura, diminuindo 1 vaga do evento.
3. Um belíssimo modal com estilo Neo-Brutalista será aberto mostrando o seu código hash do ingresso (Ex: `74f8e5b...`). **Copie esse código.**

### 4. Validação na Catraca (Scanner)
1. No topo da tela do Dashboard, clique no pequeno botão discreto **"MODO CATRACA"**.
2. Você será levado para a interface focada de portaria.
3. Se estiver em um PC/Mobile com câmera, clique em **"Alternar para Câmera"** e aponte um QR Code.
4. Para testar sem câmera, permaneça no modo "Digitação Manual", cole o código hash que você copiou no passo 3 e pressione **Validar**.
5. Aprecie o feedback visual imersivo (Verde para Acesso Liberado, e Vermelho caso tente validar o mesmo ingresso duas vezes - Barrado por fraude).
