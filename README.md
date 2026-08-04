# DA Hub: O Ecossistema Definitivo para Diretórios Acadêmicos 🚀

Um sistema implacável e hiper-veloz para gerenciar eventos, validar presenças e esmagar filas na entrada das festas universitárias. Desenhado sob a estética Neo-Brutalista, o DA Hub não pede licença: ele **funciona**.

---

## 🛠 Stack Tecnológica de Elite

A arquitetura foi escolhida para sobreviver a picos de acesso, ataques básicos e fraudes na catraca.

### **Backend (A Fortaleza)**
- **Java 21 & Spring Boot 3.3.0**: O coração do ecossistema.
- **Spring Security & JJWT**: Autenticação baseada em Tokens JWT com roles blindadas.
- **Spring Data JPA**: Abstração limpa para acesso a dados, blindada com `@Version` para **Optimistic Locking** (anti-fraude na catraca).
- **Bucket4j**: Rate Limiting rigoroso alocado em memória. Ninguém vai derrubar seu login com força bruta.
- **H2 Database (In-Memory)**: Para facilitar o desenvolvimento sem necessidade de subir um Docker. Em produção, substitua pelo PostgreSQL na URL JDBC.

### **Frontend (A Interface Brutal)**
- **React & Vite**: O motor de renderização instantâneo.
- **Tailwind CSS**: Para o design-system de alta granularidade.
- **Estética Neo-Brutalista**: Cores vibrantes, sombras duras (`box-shadow`), bordas marcantes e tipografia pesada. A interface parece um pôster lambe-lambe digital vivo.
- **React Router Dom**: Gestão implacável de Rotas. O `ProtectedRoute` chuta os alunos curiosos para fora das abas da Diretoria em microssegundos.
- **HTML5 QR Code Scanner**: O leitor de credenciamento que usa a câmera traseira do tablet para ler Ingressos a $O(1)$.

---

## ⚡ Comandos de Execução Básica

Clone o repositório e abra os terminais. 

### 1. Ligando o Reator (Backend)
Vá para a pasta `da-hub-api` e dispare o script do Maven. Ele vai baixar a internet inteira na primeira vez, seja paciente.

```powershell
cd da-hub-api
.\mvnw.cmd spring-boot:run
```
*(Opcional: Para gerar o JAR de produção `.\mvnw.cmd clean package -DskipTests`)*

> O Banco de Dados H2 vive na memória! Se você derrubar o backend, todos os ingressos, alunos e eventos morrem com ele. Mas relaxe, a *Seed Inicial* sempre será recriada.

### 2. Ligando os Monitores (Frontend)
Vá para a pasta `da-hub-web`, instale os pacotes e suba o Vite.

```powershell
cd da-hub-web
npm install
npm run dev -- --host
```

A aplicação estará esperando em `http://localhost:5173`.

---

## 🔑 Perfis de Acesso (Credenciais Iniciais)

O `DataInitializer.java` cria dois deuses sempre que o Spring Boot acorda. Use-os para dominar a plataforma antes de se cadastrar:

| Perfil | E-mail | Senha | Poderes |
| :--- | :--- | :--- | :--- |
| **A Diretoria (VP)** | `diretoria@dahub.dev` | `admin` | Cria Eventos. Acessa o Modo Catraca. Imparável. |
| **O Aluno Padrão** | `aluno@dahub.dev` | `123` | Vê eventos. Clica em "Garantir Ingresso". Mostra o QR Code. |

> **Nota de Segurança**: Novos cadastros criados pela tela `/register` do site recebem **inegociavelmente** a role `STUDENT`. A porta dos fundos da API foi lacrada no Service.

---

## 🧭 Guia de Roteamento Front-end

A navegação foi projetada para ter paredes grossas entre os papéis de usuário.

- `/` (Login): O grande portal. Sem conta? Clique no link "Crie uma conta" para ir para a página brutalista de cadastro.
- `/register` (Cadastro): Captura Nome, Email, Matrícula e Senha. 
- `/dashboard` (Painel): 
  - Se for `STUDENT`: Vê cards de evento e clica para gerar o ingresso (Modal de QR Code).
  - Se for `VP` ou `DIRECTOR`: Vê o botão **"+ Novo Evento"** e o glorioso atalho **"Modo Catraca"** no header.
- `/scanner` (A Catraca): A zona militarizada. Se um Aluno tentar forçar essa URL, ele será redirecionado em um piscar de olhos. Híbrida: Ligar Câmera ou Digitar Hash manualmente.

---

## 🎨 Novas Funcionalidades v1.1.0

### 1. 💳 Eventos Pagos & Integração Mercado Pago
- Criador do evento pode ativar a opção **"Evento Pago"** com valor em R$.
- Ingressos nascem com status `PENDING_PAYMENT` e geram **Payload PIX / Link Checkout do Mercado Pago**.
- Confirmação automática via Webhook/Sandbox alterando o ingresso para `PAID`.

### 2. 📁 Upload Seguro de Anexos (Armazenamento Anti-Abuso)
- O criador do evento pode adicionar campos customizados de anexo (ex: *"Comprovante de estudante"*, *"Envio da arte"*).
- Validação no backend com whitelist de MIME types (`image/*`, `application/pdf`, `video/mp4`, `audio/mpeg`) e limite de 15MB.
- **Hospedagem Gratuita & Segura:** Arquivos gravados no disco em `/uploads/` com nome randômico UUID para eliminar Path Traversal e Execução de Código (RCE) conforme o **Manual do Vibecoder**.

### 3. 👥 Gestão de Candidatos & Relatórios PDF
- Painel Admin para busca, filtragem e alteração de presença manual de candidatos (`PAID` <-> `USED`).
- Visualizador de anexos integrado para fotos, vídeos, áudios e documentos.
- **Gerador de Relatório PDF:** Botão em 1-clique (`jsPDF`) que compila o relatório oficial A4 com estatísticas do evento, candidatos presentes (QR Code lido) e ausentes (com nome e matrícula).

### 4. 📺 Modo TV / Datashow HDMI
- Transmissão em **Tela Cheia** (*Fullscreen API*) otimizada para projetores/TVs via cabo HDMI.
- Carrossel automático das artes, vídeos e imagens dos candidatos inscritos.
- Configuração de tempo de slide (3s, 5s, 10s, 15s), exibição/ocultação de nome/matrícula do aluno e ajuste de proporção (`contain`/`cover`).

---

## ⚔️ Roteiro de Testes Táticos

Quer ver a plataforma brilhar sob pressão? Siga este roteiro.

### 1. Teste de Rate Limiting (Ataque DDoS de Boteco)
Tente "brutar" a tela de login. Dispare mais de 10 tentativas erradas de login seguidas em menos de 1 minuto. 
Na 11ª tentativa, você nem receberá mais "Unauthorized". O Bucket4j no backend vai te dar um Block com **`429 Too Many Requests`**.

### 2. Teste do Cambista (Locking Otimista)
Quer clonar um ingresso? 
1. Entre como Aluno e garanta um ingresso.
2. Abra o Modal e copie a Hash Manual.
3. Abra duas abas anônimas lado a lado com a conta de `VP` no `/scanner`.
4. Cole a Hash nas duas janelas.
5. Pressione ENTER quase ao mesmo tempo nas duas.
> **O Resultado:** A primeira valida, marca `USED` e troca a `@Version` no banco. A segunda toma um *Conflict 409*, interceptado silenciosamente pelo `GlobalExceptionHandler`, que devolve "Conflito: Ingresso já escaneado". Zero fraudes.

### 3. Teste de Penetração Frontend (Escalação de Privilégios)
Logue como aluno. Abra a URL e digite `http://localhost:5173/scanner`. Pressione Enter.
Observe a maravilha do React Router Dom empurrando seu boneco de volta para o Dashboard.

---

## 🚀 Próximos Passos (Roadmap)

A base do DA Hub é sólida. Para o próximo semestre, o mapa do tesouro é claro:

- **Deploy em Nuvem:** Hospedar o Front-end (ex: Vercel) e o Back-end/Banco de Dados (ex: Render, Railway ou AWS) para acesso público.
- **Módulo de Competições:** Criar o sistema de Chaveamentos (Brackets) para os torneios de E-games.
- **Módulo de Artes e Cultura:** Submissão e aprovação de exposições/bandas.
- **Segurança Expandida:** Implementação avançada de Route Guards no React e Blacklist de Tokens.

---

Feito com ☕ e muito *border-4 border-zinc-950* pelo time DA Hub.
