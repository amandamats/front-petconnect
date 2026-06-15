# Prompt: Frontend para o sistema PetConnect

Crie uma aplicação frontend que consome a API REST do **PetConnect**, um sistema de gerenciamento de adoção de animais. A API já está implementada em Spring Boot (Java); este prompt descreve tudo o que o frontend precisa saber sobre ela para construir as telas, formulários, listagens e fluxos corretamente.

---

## 0. Stack e requisitos técnicos

- **Framework**: React (Vite), JavaScript (ou TypeScript, se preferir).
- **Estilização**: CSS simples ou Tailwind — priorize algo rápido de configurar.
- **Requisições HTTP**: `fetch` nativo ou `axios`.
- **Roteamento**: `react-router-dom`, com rotas para login, lista de pets, detalhe/edição de pet, lista de adotantes, cadastro/edição de adotante, e tela de adoções.
- **Autenticação**: Basic Auth — armazenar usuário/senha em memória (estado React) ou `sessionStorage` após o login, e incluir o header `Authorization: Basic <base64(usuario:senha)>` em toda requisição que exigir autenticação (ver seção 2).
- **Estrutura**: projeto deve poder ser rodado com `npm install` seguido de `npm run dev`, apontando para a API em `http://localhost:8080` (configurável via variável de ambiente, ex: `VITE_API_URL`).
- O backend precisa de CORS habilitado para a origem do frontend (isso é responsabilidade do backend, não do frontend — apenas esteja ciente de que requisições vão precisar de `credentials: 'include'` no `fetch`/`axios` por causa do Basic Auth).

---

## 1. Contexto geral

O PetConnect gerencia três entidades principais:

- **Pets** — animais disponíveis para adoção.
- **Adotantes** — pessoas cadastradas que podem adotar.
- **Adoções** — o vínculo entre um pet e um adotante, com um fluxo de aprovação.

A API responde e recebe **JSON**. Base URL: `http://localhost:8080` (ajustável via variável de ambiente).

---

## 2. Autenticação

A API usa **HTTP Basic Auth**.

- Usuário: `admin`
- Senha: `admin123`

Regras de acesso:

- `GET /pets` e `GET /pets/{id}` são **públicos** — não exigem autenticação.
- Todos os outros endpoints (`POST`, `PUT`, `DELETE` em `/pets`, e tudo em `/adotantes` e `/adocoes`) **exigem autenticação**.
- Se a autenticação não for enviada ou estiver incorreta em uma rota protegida, a API responde `401 Unauthorized`.

O frontend deve ter uma tela de login simples (usuário/senha) que armazena as credenciais (em memória/sessão) e as envia via header `Authorization: Basic <base64(usuario:senha)>` em todas as requisições que exigem autenticação.

---

## 3. Tratamento de erros

Todos os erros da API seguem o mesmo formato JSON:

```json
{
  "timestamp": "2026-06-14T10:30:00",
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Pet com ID 5 não foi encontrado"
}
```

Códigos de status possíveis e como o frontend deve tratá-los:

| Status | Quando acontece | Como exibir |
|---|---|---|
| `400` | Erro de validação de campo, ou regra de negócio (ex: "Email já cadastrado", "Pet indisponível para adoção", "Adoção já finalizada") | Exibir `message` perto do campo/ação relacionada |
| `401` | Credenciais ausentes/incorretas | Redirecionar para login |
| `404` | Recurso não encontrado (pet, adotante ou adoção com ID inexistente) | Exibir mensagem amigável de "não encontrado" |
| `500` | Erro inesperado | Exibir mensagem genérica de erro do sistema |

Sempre exiba o campo `message` para o usuário — ele já vem em português e descreve o problema de forma legível.

---

## 4. Recurso: Pets

### 4.1 Modelo de dados

**Enviado pelo frontend (`PetRequestDTO`)**:

```json
{
  "nome": "Rex",
  "idade": 3,
  "especie": "Cachorro"
}
```

- `nome`: texto, obrigatório.
- `idade`: número inteiro, opcional, mas se enviado deve ser **maior que zero** (não aceita 0 ou negativo).
- `especie`: texto, obrigatório.

**Recebido do backend (`PetResponseDTO`)**:

```json
{
  "id": 1,
  "nome": "Rex",
  "adotado": false,
  "idade": 3,
  "especie": "Cachorro",
  "status": "DISPONIVEL"
}
```

- `status` é um enum com os valores: `"DISPONIVEL"`, `"RESERVADO"`, `"ADOTADO"`.
- `adotado` é um booleano derivado de `status` (`true` apenas quando `status == "ADOTADO"`).

O cliente **nunca envia** `id`, `adotado` ou `status` — esses campos são controlados pelo sistema.

### 4.2 Endpoints

**Criar pet**
```
POST /pets
Body: PetRequestDTO
→ 201 Created + PetResponseDTO (status sempre criado como DISPONIVEL)
```

**Listar pets (com filtros e paginação)**
```
GET /pets?nome=&especie=&idadeMin=&idadeMax=&status=&page=0&size=10
→ 200 OK + Page<PetResponseDTO>
```

Todos os parâmetros de query são opcionais:
- `nome`: busca parcial, case-insensitive.
- `especie`: busca exata, case-insensitive.
- `idadeMin` / `idadeMax`: faixa de idade (inclusive).
- `status`: filtra por `DISPONIVEL`, `RESERVADO` ou `ADOTADO`.
- `page`: número da página, começando em `0` (padrão `0`).
- `size`: itens por página (padrão `10`).

A resposta é um objeto `Page` do Spring, com este formato:

```json
{
  "content": [ /* array de PetResponseDTO */ ],
  "totalElements": 42,
  "totalPages": 5,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}
```

O frontend deve usar `content` para a lista, e `totalPages`/`number` para montar a paginação.

**Buscar pet por ID**
```
GET /pets/{id}
→ 200 OK + PetResponseDTO
→ 404 se não existir
```

**Atualizar pet**
```
PUT /pets/{id}
Body: PetRequestDTO
→ 200 OK + PetResponseDTO
→ 404 se não existir
```
Importante: esse endpoint **não altera** `status`/`adotado` — apenas `nome`, `idade` e `especie`. A mudança de status acontece exclusivamente pelo fluxo de adoção (seção 6).

**Deletar pet**
```
DELETE /pets/{id}
→ 204 No Content
→ 404 se não existir
```

---

## 5. Recurso: Adotantes

### 5.1 Modelo de dados

**Enviado pelo frontend (`AdotanteRequestDTO`)**:

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "cpf": "12345678900"
}
```

- `nome`: texto, obrigatório.
- `email`: texto, obrigatório, precisa ser um e-mail válido. Deve ser **único** — se já existir um adotante com esse e-mail, a API retorna `400` com a mensagem "Email já cadastrado".
- `telefone`: texto, obrigatório.
- `cpf`: texto, obrigatório. Recomenda-se aplicar uma máscara de CPF (`000.000.000-00`) no formulário, mas enviar apenas os dígitos (ou conforme o backend esperar).

**Recebido do backend (`AdotanteResponseDTO`)**:

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999"
}
```

Note que **`cpf` não é retornado pela API** por questões de privacidade — o frontend não deve esperar ou exibir esse campo em listagens/detalhes, apenas coletá-lo no formulário de cadastro/edição.

### 5.2 Endpoints (todos exigem autenticação)

```
POST   /adotantes        → 201 Created + AdotanteResponseDTO
GET    /adotantes         → 200 OK + AdotanteResponseDTO[]   (sem paginação)
GET    /adotantes/{id}    → 200 OK + AdotanteResponseDTO | 404
PUT    /adotantes/{id}    → 200 OK + AdotanteResponseDTO | 404
DELETE /adotantes/{id}    → 204 No Content | 404
```

Atenção: o `PUT` exige **todos** os campos do `AdotanteRequestDTO`, incluindo `cpf` — não é uma atualização parcial. O formulário de edição deve vir pré-preenchido com os dados atuais (exceto `cpf`, que precisará ser digitado novamente pelo usuário, já que não é retornado pela API).

---

## 6. Recurso: Adoções

Esta é a entidade central do sistema — representa o processo de um adotante adotando um pet, com um fluxo de estados.

### 6.1 Modelo de dados

**Enviado pelo frontend (`AdocaoRequestDTO`)**:

```json
{
  "petId": 1,
  "adotanteId": 2
}
```

Ambos os campos são `Long` (IDs) e obrigatórios.

**Recebido do backend (`AdocaoResponseDTO`)**:

```json
{
  "id": 10,
  "petId": 1,
  "nomePet": "Rex",
  "adotanteId": 2,
  "nomeAdotante": "João Silva",
  "dataAdocao": "2026-06-14T10:30:00",
  "status": "PENDENTE"
}
```

- `status` é um enum com os valores: `"PENDENTE"`, `"APROVADA"`, `"CANCELADA"`.
- `nomePet` e `nomeAdotante` já vêm prontos para exibição — o frontend não precisa buscar essas informações separadamente.

### 6.2 Fluxo de status (muito importante para a UI)

```
Pet DISPONIVEL
      │
      │  POST /adocoes (cria adoção)
      ▼
Pet RESERVADO  ──┐
Adoção PENDENTE  │
      │          │
      │ aprovar  │ cancelar
      ▼          ▼
Pet ADOTADO   Pet DISPONIVEL
Adoção        Adoção
APROVADA      CANCELADA
```

- Criar uma adoção **só é permitido** se o pet estiver `DISPONIVEL`. Caso contrário, a API retorna `400` com a mensagem "Pet indisponível para adoção".
- Aprovar ou cancelar **só é permitido** se a adoção estiver `PENDENTE`. Caso contrário, `400` com a mensagem "Adoção já finalizada".
- Uma vez `APROVADA` ou `CANCELADA`, a adoção é definitiva — não há como reabrir.

### 6.3 Endpoints (todos exigem autenticação)

**Criar (solicitar) adoção**
```
POST /adocoes
Body: { "petId": 1, "adotanteId": 2 }
→ 201 Created + AdocaoResponseDTO (status PENDENTE)
→ 404 se pet ou adotante não existirem
→ 400 se o pet não estiver DISPONIVEL
```

**Aprovar adoção**
```
PUT /adocoes/{id}/aprovar
→ 200 OK + AdocaoResponseDTO (status APROVADA)
→ 404 se a adoção não existir
→ 400 se a adoção não estiver PENDENTE
```

**Cancelar adoção**
```
PUT /adocoes/{id}/cancelar
→ 200 OK + AdocaoResponseDTO (status CANCELADA)
→ 404 se a adoção não existir
→ 400 se a adoção não estiver PENDENTE
```

> ⚠️ **Limitação conhecida do backend**: atualmente, depois que uma adoção é `CANCELADA`, tentar criar uma nova adoção para o **mesmo pet** pode falhar com erro `500` (restrição de banco de dados ainda não corrigida). Até essa correção, o frontend deve exibir uma mensagem de erro genérica e amigável nesse caso (ex: "Não foi possível concluir a operação, tente novamente mais tarde"), em vez de mostrar o erro técnico.

---

## 7. Telas sugeridas

**Login**
- Formulário simples de usuário/senha (Basic Auth).

**Lista de Pets** (pode ser pública, sem login)
- Tabela/cards com `nome`, `especie`, `idade`, `status`.
- Filtros: nome, espécie, faixa de idade, status.
- Paginação.
- Indicação visual do `status` (ex: badge verde para `DISPONIVEL`, amarelo para `RESERVADO`, cinza para `ADOTADO`).
- Botões de editar/excluir (visíveis apenas se autenticado).

**Cadastro/Edição de Pet**
- Formulário com `nome`, `idade`, `especie`.
- Validação no frontend espelhando as regras da API (nome obrigatório, idade positiva, espécie obrigatória).

**Lista de Adotantes**
- Tabela com `nome`, `email`, `telefone`.
- Botões de editar/excluir.

**Cadastro/Edição de Adotante**
- Formulário com `nome`, `email`, `telefone`, `cpf` (com máscara).
- Tratar erro `400` "Email já cadastrado" mostrando a mensagem perto do campo de e-mail.

**Fluxo de Adoção**
- Tela para selecionar um pet `DISPONIVEL` e um adotante existente, e criar a adoção (`POST /adocoes`).
- Painel/lista de adoções `PENDENTE`, com botões de "Aprovar" e "Cancelar" para cada uma.
- Histórico de adoções `APROVADA`/`CANCELADA` (somente leitura).

---

## 8. Observações finais

- A funcionalidade de **relatórios** (`/relatorios/**`) está reservada na configuração de segurança do backend, mas ainda **não existe** — não construir telas para isso ainda.
- Sempre que possível, espelhar no frontend as mesmas mensagens de validação que a API retorna, para manter consistência entre o que o usuário vê no formulário e o que a API valida.