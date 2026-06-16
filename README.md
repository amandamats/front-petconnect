# 🐾 PetConnect

Sistema de gerenciamento de adoção de cães e gatos desenvolvido para a disciplina de Implementação de Software.

O projeto tem como objetivo facilitar o processo de adoção de pets, permitindo o gerenciamento de animais, adotantes e adoções de forma organizada e segura.

---

# 🚀 Tecnologias Utilizadas

## Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven


## Banco de Dados
- PostgreSQL

## Ferramentas
- Git
- GitHub
- Postman
- Trello
- Bruno

---

# 🏗 Arquitetura

O projeto segue o padrão:

MVC + Service Layer

Estrutura principal:

src/main/java/com/petconnect
├── controller
├── service
├── repository
├── entity
├── dto
├── exception
├── config

---

# 📌 Funcionalidades

## Pets
- Cadastro de pets
- Atualização de pets
- Exclusão de pets
- Listagem de pets

## Adotantes
- Cadastro de adotantes
- Consulta de adotantes

## Adoções
- Processo de adoção
- Controle de pets adotados
- Validações de negócio

## Relatórios
- Pets disponíveis
- Pets adotados
- Histórico de adoções

---

# 📋 Regras de Negócio

- Um pet não pode ser adotado duas vezes
- O adotante deve estar cadastrado
- Pets adotados não aparecem como disponíveis
- Campos obrigatórios devem ser validados

---

# 🔥 Tratamento de Exceções

A API possui tratamento global de exceções utilizando:

- @RestControllerAdvice
- ResponseEntity
- Status HTTP padronizados

Exemplo de resposta:

```json
{
  "timestamp": "2026-05-18T22:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Pet já adotado",
  "path": "/adocoes"
}
```

---

# ⚙ Como Executar

## 1. Clonar repositório

```bash
git clone URL_DO_REPOSITORIO
```

## 2. Configurar banco PostgreSQL

Criar banco:

```sql
CREATE DATABASE petconnect;
```

---

## 3. Configurar application.properties

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/petconnect
spring.datasource.username=postgres
spring.datasource.password=senha
```

---

## 4. Executar aplicação

```bash
mvn spring-boot:run
```

--- 

## 5. Integração Frontend + Backend

O projeto PetConnect é dividido em dois repositórios separados:

🖥️ Frontend (React) → este repositório

⚙️ Backend (Spring Boot) → (https://github.com/Polyana-4ana/petconnect)
Essa separação exige configuração para comunicação entre as aplicações via API REST.
O frontend consome a API do backend através de requisições HTTP.

Após rodar back-end:
```bash
npm install
npm start
```

# ⚙ Como Testar requisições http
1. executar a aplicação
2. acessar ```http://localhost:8080/swagger-ui/index.html#``` - verificar se a documentação está rodando localmente
3. acessar o Bruno ou Postman
4. clicar em importar e depois em url´s
5. colar no campo ```http://localhost:8080/v3/api-docs```

# 📡 Endpoints Principais

Após executar o projeto acessar ```http://localhost:8080/swagger-ui/index.html#``` 

---

# 🌱 GitFlow

Estratégia utilizada:

- main
- develop
- feature/*

Fluxo de trabalho:

feature → develop → main

---

# 👥 Equipe

- Polyana Santos
- Nathalia Martins
- Amanda Matos
- Arthur Auadi
  
---

# 📌 Status do Projeto

🚧 Em desenvolvimento
  
