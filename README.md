# Starter

Monorepo full-stack em TypeScript para começar projetos novos: uma API AdonisJS 7 com Postgres, um SPA React com cliente tipado de ponta a ponta, design system com shadcn, testes em três camadas e deploy via Docker. As regras de arquitetura não vivem só em documentação: o lint e os hooks de git aplicam a maior parte delas.

| Workspace       | O que é                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `apps/backend`  | API AdonisJS 7 (Lucid + Postgres, VineJS, auth por token, Drive/S3, Mail, health checks).         |
| `apps/frontend` | SPA React 19 + Vite + TanStack Router, consumindo a API pelo cliente Tuyau.                       |
| `packages/ui`   | Design system compartilhado: shadcn (Base UI), Tailwind 4, tokens em `globals.css`.               |
| `tests/`        | Testes e2e (runner `e2e`, Playwright + agente).                                                   |
| `tools/oxlint/` | Regras de lint próprias (`anti-slop`).                                                            |
| `docs/`         | [`architecture.md`](docs/architecture.md) e [`testing.md`](docs/testing.md): leitura obrigatória. |

## Pré-requisitos

- **Node 24** (versão fixada em `mise.toml`; com [mise](https://mise.jdx.dev), `mise install`).
- **pnpm 12** via Corepack (`corepack enable`): a versão vem de `packageManager` no `package.json`.
- **Docker** com Compose, para Postgres, Mailpit e RustFS em desenvolvimento.

## Começando um projeto novo

1. **Copie o starter sem o histórico** e inicie um repositório novo:

   ```sh
   git clone --depth 1 <url-do-starter> meu-projeto
   cd meu-projeto
   rm -rf .git && git init
   ```

2. **Dê um nome ao projeto.** `APP_NAME` define o nome dos containers, dos volumes, do banco e do bucket, então dois projetos baseados no starter não colidem na mesma máquina.
   - Em `apps/backend/.env.example`, troque `APP_NAME=starter`.
   - Em `apps/backend/.env.test`, troque `DB_DATABASE=starter_test` para `<APP_NAME>_test`: o Postgres cria esse banco de teste no primeiro boot do volume (`database/docker/create_test_database.sh`) e os nomes precisam bater.
   - Opcional: o escopo `@monorepo/*` dos pacotes e o `name` do `package.json` raiz. Se trocar o escopo, troque também todos os imports (`@monorepo/ui`, `@monorepo/backend/registry`...) e os filtros do `Dockerfile`.

3. **Instale e configure o ambiente:**

   ```sh
   pnpm install                         # também instala os hooks do lefthook
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   cd apps/backend && node ace generate:key && cd ../..
   ```

4. **Suba tudo e rode as migrations:**

   ```sh
   pnpm dev                             # docker compose up -d --wait && turbo dev
   cd apps/backend && node ace migration:run
   ```

   | Serviço           | Endereço                                   |
   | ----------------- | ------------------------------------------ |
   | Frontend          | http://localhost:5173                      |
   | API               | http://localhost:3333 (rotas em `/api/v1`) |
   | Mailpit (e-mails) | http://localhost:8025                      |
   | Console RustFS    | http://localhost:9001/rustfs/console       |

5. **Limpe o que é exemplo.** O starter vem com cadastro, login, perfil e avatar como referência. Mantenha o que servir; o resto você remove pelos módulos (veja [Arquitetura do backend](#arquitetura-do-backend)).

6. **Opcional, para agentes e e2e:** `pnpm docs:pull` baixa a documentação do AdonisJS, Lucid e VineJS em `repos/` (ignorado pelo git), e uma `ANTHROPIC_API_KEY` num `.env` na raiz habilita os passos `agent.*` dos testes e2e.

## Scripts

Todos rodam da raiz.

| Comando                        | O que faz                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `pnpm dev`                     | Sobe os containers e roda backend (HMR) e frontend em paralelo pelo Turbo.   |
| `pnpm codegen`                 | Regenera os tipos do Tuyau e os registros sem subir o servidor (útil em CI). |
| `pnpm build`                   | Build de produção de todos os workspaces.                                    |
| `pnpm typecheck`               | `tsc` em todos os workspaces.                                                |
| `pnpm lint` / `lint:fix`       | oxlint com análise de tipos, incluindo fronteiras de módulo e design system. |
| `pnpm format` / `format:check` | oxfmt.                                                                       |
| `pnpm test`                    | Testes unitários e funcionais do backend (Japa).                             |
| `pnpm test:e2e`                | Testes e2e; sobe o app sozinho se não estiver rodando.                       |
| `pnpm docs:pull`               | Baixa ou atualiza as docs de referência em `repos/`.                         |

Do `apps/backend`, `node ace` dá acesso aos geradores, migrations (`migration:run`, `migration:fresh`), testes filtrados (`node ace test --files=...`) e ao REPL (`node ace repl`).

## O que vem configurado

### Backend (`apps/backend`)

- **AdonisJS 7** organizado em módulos (`app/<módulo>/`), com aliases por módulo (`#users/*`, `#auth/*`...).
- **Postgres 18 + Lucid.** Toda chave primária é um UUIDv7 gerado pelo banco (`uuidv7()`), inclusive nas tabelas criadas pelo stub de `make:migration`. Rotas com `:id` só casam com UUIDs, então um id inválido vira 404 e não um erro de cast. `database/schema.ts` é regenerado a cada `migration:run` e os models estendem as classes dele.
- **Autenticação** com dois guards: `api` (tokens de acesso, padrão) e `web` (sessão). Endpoints prontos: `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `POST /api/v1/account/logout`, `GET /api/v1/account/profile`, `PUT /api/v1/account/avatar`.
- **Respostas padronizadas.** `ctx.serialize()` (em `providers/api_provider.ts`) envolve toda resposta em `{ data }` e formata a paginação do Lucid; o tratador de exceções força JSON.
- **Validação** com VineJS: `request.validateUsing()` em todo controller.
- **Arquivos (attachments)** via Drive/S3: upload em duas etapas, URLs assinadas de uma hora, regras por caso de uso e limpeza de órfãos com `node ace attachments:prune`. Em dev, o S3 é o RustFS do Compose e o bucket é criado sozinho.
- **E-mail** com `@adonisjs/mail` por SMTP; em dev tudo cai no Mailpit.
- **Health checks:** `GET /health/live` (liveness, sem dependências) e `GET /health/ready` (disco, memória, Postgres, conexões, storage), protegido pelo header `x-monitoring-secret`.
- **Segurança:** Shield, sessão em cookie `httpOnly`/`secure` em produção, CORS liberado em dev e restrito à allowlist `CORS_ORIGIN` fora dele.
- **Env validado no boot** (`start/env.ts`): uma variável faltando derruba o processo na hora, não em runtime.
- **Testes** com Japa: suítes `unit` e `functional` dentro de cada módulo, cliente de API tipado pelas rotas, banco de teste separado e migrado antes da suíte.
- **Geradores próprios:** `make:module` e stubs ejetados (`stubs/`) que escrevem dentro do módulo certo.

### Frontend (`apps/frontend`)

- **React 19 + Vite 8 + TanStack Router** com rotas por arquivo (`src/routes/`), code splitting automático e contexto de auth no router.
- **Cliente Tuyau** (`src/lib/api.ts`) tipado a partir do backend: rotas, corpo da requisição e resposta vêm de `@monorepo/backend/registry`, e os tipos dos transformers de `@monorepo/backend/data` (`Data.Users.User`). O token é injetado em todo request.
- **Tailwind 4** e componentes de `@monorepo/ui`.
- Em produção, servido por **nginx** com cache imutável para `/assets/` e fallback de SPA.

### Design system (`packages/ui`)

- shadcn (estilo `base-mira`, sobre Base UI), ícones Lucide, fonte Inter, tokens de cor em `src/styles/globals.css`.
- Para adicionar componentes, rode o CLI do shadcn de dentro de `packages/ui` (ou de `apps/frontend`, que já aponta os aliases para o pacote).
- O lint do shadcn bloqueia cores cruas, estilos inline, valores arbitrários e restyle de componentes no app: a aparência é responsabilidade do componente, o app só cuida do layout.

### Qualidade e tooling

- **oxlint** com análise de tipos, preset `@julr/tooling-configs` (com regras de AdonisJS), regras do shadcn e o plugin `anti-slop` em `tools/oxlint/` (sem `filter().map()`, sem parâmetros `unknown`, sem type assertions sem comentário `SAFETY:`, espaçamento legível...).
- **oxfmt** para formatação.
- **lefthook:** no pre-commit formata e corrige os arquivos staged e, se `modules.json` mudar, roda o lint inteiro; no commit-msg valida **Conventional Commits** com commitlint.
- **Turborepo** orquestra `dev`, `build`, `typecheck` e `test` com cache.
- **Catálogo do pnpm** em modo estrito: versões compartilhadas entre workspaces (React, TypeScript, Tailwind, Tuyau...) ficam em `pnpm-workspace.yaml` e são referenciadas como `catalog:`.
- **TypeScript 6 estrito** em todos os workspaces.
- **VS Code:** oxc como formatador e `.adonisjs/` (gerado) como somente leitura.

### Testes e2e

- Runner [`e2e`](https://www.npmjs.com/package/e2e) (`e2e.config.ts`): Playwright com passos `agent.act` para o que não vale fixar em seletor, e asserções exatas para o resto.
- `pnpm test:e2e` sobe o app via `pnpm dev` se ele não estiver no ar; `test:e2e:ci` usa o cache de replay em modo estrito.
- `.mcp.json` registra o servidor MCP do e2e, para agentes navegarem no app rodando.

### Agentes de código

- `AGENTS.md` (com `CLAUDE.md` apontando para ele) resume as regras do repositório para agentes.
- `pnpm docs:pull` deixa as docs oficiais do AdonisJS, Lucid e VineJS locais, para consulta sem depender da web.
- Skill de e2e em `.agents/skills/e2e`.

### Deploy

- `Dockerfile` multi-stage com dois alvos: `backend` (Node Alpine, usuário sem privilégios, `HEALTHCHECK` em `/health/live`) e `frontend` (nginx com o build estático). `VITE_API_URL` entra como build arg, já que o Vite embute a URL no bundle.
- `compose.dokploy.yaml` para o [Dokploy](https://dokploy.com): um serviço `migrate` roda `migration:run --force` e o `backend` só sobe depois que ele termina com sucesso.
- Em produção, configure ao menos `APP_KEY`, `APP_URL`, `MONITORING_SECRET`, `CORS_ORIGIN`, as variáveis do banco, do SMTP e do S3, e agende `node ace attachments:prune` (uma vez por dia basta).

## Arquitetura do backend

O guia completo está em [`docs/architecture.md`](docs/architecture.md). O essencial:

- **Um módulo por contexto de negócio**, não por tabela. Hoje: `core` (infraestrutura), `users`, `auth` e `attachments`.
- **Crie módulos com `node ace make:module <nome>`**, nunca à mão: o comando registra o alias no `package.json`, os preloads no `adonisrc.ts` e a entrada no `modules.json`, três lugares que falham em silêncio se esquecidos.
- **Dependências entre módulos são declaradas em `apps/backend/modules.json`** e aplicadas pelo lint. Um módulo novo só importa `core`; qualquer outra dependência é uma decisão revisada, adicionada no mesmo commit e nunca formando ciclo.
- **Fluxo de uma feature:** model + migration (`make:model <módulo>/<nome> -m -f --transformer`) → validator → action (escrita) ou query (leitura) → controller → rotas em `app/<módulo>/routes.ts` dentro de `apiRoutes()` → testes.
- **Controllers finos:** validam com `request.validateUsing()`, chamam uma action ou query e retornam `serialize(...)`. Sem isso, os tipos do frontend saem vazios (`any` ou `ModelObject` sem campos).
- **Nomes são ligação:** controllers terminam em `_controller.ts` e transformers em `_transformer.ts`, ou ficam de fora dos registros gerados sem nenhum aviso.

## Boas práticas

### Código

- **Antes de escrever, ache o exemplo mais próximo e siga o formato dele.** O starter tem pelo menos um exemplo de cada peça: action, query, service, transformer, validator, regra de attachment, health check, teste funcional e e2e.
- **Actions** (`actions/<verbo>_<substantivo>.ts`): uma classe com um único `handle(input)`, que recebe uma interface simples, nunca o `HttpContext`. Uma action não chama outra; o que é compartilhado vira service ou query.
- **Efeitos colaterais por eventos** (`<módulo>:<verbo_no_passado>`), emitidos depois do commit da transação, para que nenhum listener veja uma escrita desfeita.
- **Corridas de leitura e escrita:** quando um valor depende de linhas existentes (posição, número sequencial), use `forUpdate()` dentro de uma transação e garanta com uma constraint `unique`.
- **Erros esperados** saem pelos helpers da resposta (`response.notFound({ message, key })`), e o frontend os distingue com `error.isStatus(404)`.
- **Arquivos** sempre via attachments: upload primeiro, claim na mesma transação da escrita, coluna `*_attachment_id` com FK. Nunca apague um attachment à mão; remova a referência e deixe o prune cuidar.
- **Comentários** só para o que o código não diz: o porquê, uma restrição que não é óbvia, um link para issue.
- **Diffs focados:** nada de renomear ou refatorar o que a tarefa não pede.

### Testes

Política completa em [`docs/testing.md`](docs/testing.md). Em resumo:

- Cada comportamento tem **um único dono**: a camada mais baixa que consegue observá-lo (unit para lógica pura, functional para o contrato HTTP, e2e para a ligação entre front e back, um teste por jornada crítica).
- Antes de criar um teste, **nomeie a regressão** que ele pega e que nenhum outro pega. Sem regressão nomeável, sem teste.
- Nada de testar framework, biblioteca ou o que o type checker já garante.

### Frontend

- Consuma a API **só pelo cliente Tuyau**, para que uma mudança no backend quebre o typecheck do frontend em vez de quebrar em produção.
- Use os componentes de `@monorepo/ui` e os tokens do tema; cor, espaçamento e variantes novas entram no design system, não no app.

### Git

- **Conventional Commits** (`feat(users): ...`, `fix(auth): ...`, `chore(deps): ...`), com o módulo como escopo quando fizer sentido. O commitlint rejeita o resto.
- **Pronto** significa `pnpm typecheck && pnpm lint` passando, mais o teste mais específico para a mudança.

## Documentação de referência

- [AdonisJS](https://docs.adonisjs.com) · [Lucid](https://lucid.adonisjs.com) · [VineJS](https://vinejs.dev) · [Tuyau](https://docs.adonisjs.com/guides/frontend/api-client)
- [TanStack Router](https://tanstack.com/router) · [shadcn/ui](https://ui.shadcn.com) · [Tailwind CSS](https://tailwindcss.com)
- [Japa](https://japa.dev) · [Turborepo](https://turbo.build) · [oxc](https://oxc.rs)
