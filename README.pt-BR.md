<div align="center">

# Starter

**Template de monorepo full-stack em TypeScript: API AdonisJS 7 + SPA React, tipado de ponta a ponta.**

[English](README.md) · Português

![Node 24](https://img.shields.io/badge/node-24-339933?logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)
![AdonisJS 7](https://img.shields.io/badge/AdonisJS-7-5A45FF?logo=adonisjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Postgres 18](https://img.shields.io/badge/Postgres-18-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![MIT](https://img.shields.io/badge/license-MIT-blue)

</div>

## Stack

```mermaid
flowchart LR
  subgraph frontend["apps/frontend"]
    SPA["React 19 · Vite<br/>TanStack Router"]
  end
  subgraph backend["apps/backend"]
    API["API AdonisJS 7"]
    W["Worker de filas"]
  end
  UI["packages/ui<br/>shadcn · Tailwind 4"] --> SPA
  SPA -- "cliente tipado Tuyau" --> API
  API --> PG[(Postgres)]
  API --> R[(Redis)]
  W --> R
  API --> S3[(S3 / RustFS)]
  API --> M[SMTP / Mailpit]
```

| Workspace       | O que é                                                         |
| --------------- | --------------------------------------------------------------- |
| `apps/backend`  | AdonisJS 7 · Lucid · VineJS · auth · Drive/S3 · Mail · filas    |
| `apps/frontend` | React 19 · Vite · TanStack Router · cliente Tuyau               |
| `packages/ui`   | Design system compartilhado (shadcn sobre Base UI, Tailwind 4)  |
| `tests/`        | Testes end-to-end (Playwright + agente)                         |
| `docs/`         | [Arquitetura](docs/architecture.md) · [Testes](docs/testing.md) |

## O que vem pronto

|     | Recurso                                                            |
| --- | ------------------------------------------------------------------ |
| 🔐  | Cadastro, login, perfil e avatar (guards de token e sessão)        |
| 🏢  | Multi-tenancy                                                      |
| 🛡️  | Papéis e permissões por tenant                                     |
| 📎  | Anexos no S3 com URLs assinadas e limpeza de órfãos                |
| ✉️  | E-mail (Mailpit em dev) e filas no Redis                           |
| ❤️  | Health checks (`/health/live`, `/health/ready`)                    |
| 🧬  | Chaves primárias UUIDv7, env validado no boot                      |
| 🧪  | Testes unitários, funcionais e e2e                                 |
| 🧹  | oxlint + oxfmt, fronteiras de módulo no lint, Conventional Commits |
| 🐳  | Dockerfile multi-stage e compose para Dokploy                      |

## Módulos

```mermaid
flowchart BT
  users --> core
  users --> attachments
  attachments --> core
  auth --> users
  tenancy --> users
  access --> tenancy
  access --> users
```

As setas são os imports permitidos, declarados em [`apps/backend/modules.json`](apps/backend/modules.json) e aplicados pelo lint.

## Começando

> Requer **Node 24**, **pnpm** via Corepack (`corepack enable`) e **Docker**.

```sh
git clone --depth 1 https://github.com/enzopita/starter.git meu-app
cd meu-app && rm -rf .git && git init
```

Dê um nome ao projeto: `APP_NAME` em `apps/backend/.env.example` e `DB_DATABASE=<APP_NAME>_test` em `apps/backend/.env.test`.

```sh
pnpm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
(cd apps/backend && node ace generate:key)

pnpm dev
(cd apps/backend && node ace migration:run)
```

| Serviço  | URL                                  |
| -------- | ------------------------------------ |
| Frontend | http://localhost:5173                |
| API      | http://localhost:3333/api/v1         |
| Mailpit  | http://localhost:8025                |
| RustFS   | http://localhost:9001/rustfs/console |

## Scripts

| Comando                        | Faz                                        |
| ------------------------------ | ------------------------------------------ |
| `pnpm dev`                     | Containers + API, worker e frontend        |
| `pnpm build`                   | Build de produção                          |
| `pnpm test` · `pnpm test:e2e`  | Testes do backend · testes end-to-end      |
| `pnpm typecheck` · `pnpm lint` | Typecheck · lint                           |
| `pnpm format`                  | Formatação                                 |
| `pnpm codegen`                 | Regenera o cliente tipado e os registros   |
| `node ace make:module <nome>`  | Novo módulo do backend (em `apps/backend`) |

## Deploy

```mermaid
flowchart LR
  D[Dockerfile] --> B["target: backend<br/>Node Alpine"]
  D --> F["target: frontend<br/>nginx"]
  B --> mig[migrate] --> api[backend] & wk[worker]
```

Veja [`compose.dokploy.yaml`](compose.dokploy.yaml) para o [Dokploy](https://dokploy.com).

## Docs

[AdonisJS](https://docs.adonisjs.com) · [Lucid](https://lucid.adonisjs.com) · [VineJS](https://vinejs.dev) · [Tuyau](https://docs.adonisjs.com/guides/frontend/api-client) · [TanStack Router](https://tanstack.com/router) · [shadcn/ui](https://ui.shadcn.com) · [Tailwind](https://tailwindcss.com) · [Japa](https://japa.dev)

Agentes de código: veja o [`AGENTS.md`](AGENTS.md).
