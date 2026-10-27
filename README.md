# API AV1 — Prisma + MySQL (XAMPP)

Backend REST com Node.js, Express, arquitetura MVC, Prisma ORM e banco MySQL/MariaDB do XAMPP. Os dados ficam no banco local e continuam disponíveis após reiniciar a API ou o computador. O modelo Prisma do usuário usa `id` inteiro autoincremental, `nome`, `email`, `senhaHash`, `created` e `updated`, persistido na tabela `usuarios`.

## Requisitos

- Node.js 20 ou superior e npm
- XAMPP com o módulo **MySQL** (MariaDB) instalado

## Preparar o XAMPP

1. Abra o **XAMPP Control Panel** e clique em **Start** na linha **MySQL**. Deixe esse módulo ativo enquanto usa a API.
2. Abra o phpMyAdmin pelo botão **Admin** da linha MySQL (ou pelo endereço local `http://localhost/phpmyadmin`).
3. Na aba SQL, crie o banco da aplicação e outro banco exclusivo para testes:

```sql
CREATE DATABASE av1_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE av1_backend_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

A configuração do exemplo usa `root` sem senha, comum em instalações locais do XAMPP. Se o seu MySQL tiver senha ou outro usuário, ajuste as URLs no `.env`. Caracteres especiais em usuário/senha devem ser codificados para URL.

## Instalar e iniciar

Na pasta do projeto:

1. Execute `npm install`.
2. Copie `.env.example` para `.env`.
3. Altere `JWT_SECRET` para uma chave aleatória com pelo menos 32 caracteres.
4. Confira `DATABASE_URL` e `TEST_DATABASE_URL` para corresponder ao MySQL do seu XAMPP.
5. Gere o cliente do Prisma com `npm run db:generate`.
6. Crie/atualize as tabelas aplicando as migrações: `npm run db:migrate`.
7. (Opcional) Popule o banco com um usuário e tarefa de demonstração usando `npm run db:seed`. A senha é gerada aleatoriamente e mostrada uma única vez no terminal.
8. Inicie a API com `npm run dev` (desenvolvimento) ou `npm start`.

A API fica disponível em `http://localhost:3000/api`. `GET /health` verifica a aplicação. A pasta `prisma/` contém o schema e as migrações versionadas. As migrações preservam usuários e tarefas ao atualizar o modelo de dados.

As tabelas `usuarios` e `tasks` são criadas pelas migrações. Rode `npm run db:seed` para criar/atualizar a conta de demonstração `antonio@av1.local` e uma tarefa relacionada. A senha local definida para a demonstração é `0808` e somente o hash é armazenado. Essa senha é fraca: use-a apenas no ambiente local de avaliação e troque-a antes de qualquer implantação pública.

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `PORT` | Porta HTTP da API | `3000` |
| `JWT_SECRET` | Segredo de assinatura do JWT; mínimo 32 caracteres | preencher localmente |
| `JWT_EXPIRES_IN` | Validade do token | `1h` |
| `DATABASE_URL` | Conexão do banco principal | `mysql://root:@127.0.0.1:3306/av1_backend` |
| `TEST_DATABASE_URL` | Conexão de banco separado, usado exclusivamente pelos testes | `mysql://root:@127.0.0.1:3306/av1_backend_test` |

Não compartilhe o `.env` nem use o banco de testes como banco principal. `.env` está ignorado pelo Git; `.env.example` não contém credenciais reais.

## Endpoints

URL base: `http://localhost:3000/api`.

| Método | Caminho | Autenticação | Operação |
| --- | --- | --- | --- |
| GET | `/health` | Não | Verifica se a API está ativa |
| POST | `/auth/register` | Não | Cadastra usuário e retorna JWT |
| POST | `/auth/login` | Não | Verifica credenciais e retorna JWT |
| GET | `/auth/me` | Bearer JWT | Retorna usuário autenticado |
| GET | `/tasks` | Bearer JWT | Lista tarefas do usuário |
| GET | `/tasks/:id` | Bearer JWT | Consulta tarefa |
| POST | `/tasks` | Bearer JWT | Cadastra tarefa |
| PATCH | `/tasks/:id` | Bearer JWT | Atualiza tarefa |
| DELETE | `/tasks/:id` | Bearer JWT | Exclui tarefa |

Todas as rotas de tarefa exigem token. O usuário só pode acessar as próprias tarefas. Envie o JWT no cabeçalho `Authorization: Bearer <token>`.

### Exemplos de JSON

Cadastro (`POST /api/auth/register`):

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "password": "senha-segura-123"
}
```

Login (`POST /api/auth/login`):

```json
{
  "email": "ana@example.com",
  "password": "senha-segura-123"
}
```

Criar tarefa (`POST /api/tasks`, com token):

```json
{
  "title": "Entregar trabalho AV1",
  "description": "Finalizar e testar a API",
  "status": "pendente",
  "dueDate": "2026-11-01"
}
```

Status aceitos: `pendente`, `em_andamento` e `concluida`. `dueDate` é opcional no formato `AAAA-MM-DD`; atualizações usam `PATCH` e aceitam um ou mais campos.

## Testes

O teste de integração usa `TEST_DATABASE_URL`, limpa os dados das tabelas nesse banco, executa `prisma db push` nele e verifica cadastro, hash da senha, login, validações, erros de JWT, CRUD e persistência depois de uma nova conexão. **Nunca aponte `TEST_DATABASE_URL` para o banco principal.**

Com o MySQL ativo no XAMPP e os dois bancos criados, execute `npm test`. Se usar um banco de teste diferente do configurado, altere `TEST_DATABASE_URL` no `.env` antes.

## Organização MVC

- `src/routes`: endpoints e validações de entrada.
- `src/controllers`: lógica das requisições e respostas HTTP.
- `src/models`: ponto único de acesso ao Prisma Client.
- `prisma/schema.prisma`: modelos `User` e `Task`, ID inteiro autoincremental e relacionamento com a tabela `usuarios`. O cadastro aceita `nome` (recomendado) e também `name` por compatibilidade.
- `prisma/migrations`: migração SQL versionada para preparar o banco.
- `src/config`: conexão Prisma.
- `src/middleware`: autenticação JWT, validação e erros.
- `tests`: testes HTTP de integração.
