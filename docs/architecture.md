# Backend architecture

`apps/backend/app/` holds one folder per **module**: a bounded context that owns its vocabulary, its tables, and its routes. A module may hold several models; modules are not 1:1 with tables. Code outside `app/` (`start/`, `config/`, `database/`, `providers/`, `tests/`) is application wiring, not a module.

| Module        | Owns                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `core`        | Infrastructure every module builds on: exception handler, global middleware, `apiRoutes`, health checks. |
| `users`       | The `User` identity: model, transformer, access tokens, the profile endpoint.                            |
| `auth`        | Behavior over that identity: sign-up, login, logout, the auth middleware.                                |
| `attachments` | Stored files: upload, signed URLs, the claim service consumers call, pruning.                            |

## Starting a new module or feature

A feature that extends an existing context goes in that module; skip step 1. All commands run from `apps/backend/`.

1. **Create the module**: `node ace make:module <name> [--events]`. Never create `app/<name>/` by hand: the command also registers the three places nothing warns about when one is missing (the `#<name>/*` alias in `package.json`, the `adonisrc.ts` preloads, `modules.json`). `--events` adds `types/events.ts` and a preloaded `start/events.ts`.
2. **Declare dependencies**: the new module may import only `core`. If it needs another module, add it to its list in `modules.json` (see [Dependencies between modules](#dependencies-between-modules)).
3. **Tables**: `node ace make:model <module>/<name> -m -f --transformer` creates the model, its factory and transformer in the module, and the migration in `database/migrations/`. Fill the migration, then `node ace migration:run`: it regenerates `database/schema.ts`, the `<Name>Schema` class the model extends, so the model doesn't typecheck before this step.
4. **Input**: `node ace make:validator <module>/<entity>`. One file per entity, one validator per use case.
5. **Behavior**: an action in `actions/` for each write, a query in `queries/` for each non-trivial read (see [Code conventions](#code-conventions)). No generator: copy the closest existing one.
6. **HTTP**: `node ace make:controller <module>/<name>`, following [Controllers and the typed client](#controllers-and-the-typed-client), and its routes in `app/<module>/routes.ts`, inside `apiRoutes()`.
7. **Tests**: `node ace make:test <module>/<name> --suite=functional` (or `unit`), only for the behaviors `docs/testing.md` assigns to that layer.
8. **Check**: `pnpm typecheck && pnpm lint` from the root. The frontend sees the new routes and response types after codegen, which `pnpm dev` runs on every change, or `node ace codegen` once.

Migrations are the one thing a module doesn't hold: they all live in `database/migrations/`, next to `database/schema.ts`. Lucid runs migration folders one after another in config order, not by timestamp, so per-module folders would let one module's foreign keys run before the tables they reference.

### Module layout

Create only the folders a module needs; `routes.ts` is the one every module has.

```
app/<module>/
  routes.ts           # preloaded; mounts under /api/v1 via apiRoutes() from #core/api_routes
  controllers/        # thin: validate → action or query → serialize
  actions/            # one write use case per file
  queries/            # one read use case per file
  services/           # behavior with side effects shared by several actions
  models/, transformers/, validators/, middleware/, exceptions/, enums/
  database/factories/
  types/events.ts     # EventsList declaration merge, when the module emits events
  start/events.ts     # its listeners, preloaded
  tests/{unit,functional}/
```

### Generators

The `make:*` commands read the ejected stubs in `apps/backend/stubs/`: the name is `<module>/<name>`, and a name without an existing module fails. `make:migration` takes a bare table name and always writes to `database/migrations/`.

```sh
node ace make:controller users/tokens --api             # app/users/controllers/tokens_controller.ts
node ace make:model users/invoice -m -f --transformer   # + database/migrations/…_create_invoices_table.ts
node ace make:validator users/invoice --resource
node ace make:transformer users/invoice
node ace make:exception users/invoice_locked
node ace make:service users/invoice_numbering
node ace make:test users/invoices --suite=functional    # --suite is required
```

- Pass every flag a command would otherwise prompt for (`--suite`): a prompt hangs a non-interactive run.
- On `make:model`, spell out `--transformer`: Lucid gives it the same `-c` alias as `--controller`.
- No generator for middleware: `make:middleware` writes a broken import into `start/kernel.ts`. Create the file in `app/<module>/middleware/` and register it in `start/kernel.ts` by hand.

## Controllers and the typed client

The frontend calls the API through Tuyau, whose types are inferred from the controllers: the request body from the validator, the response from the action's return type. Every controller action follows two rules:

- **Validate with `request.validateUsing(validator)`.** Without it, the request body is typed `any` on the frontend.
- **Return `serialize(...)`.** A model through its transformer (`serialize(UserTransformer.transform(user))`, `serialize(UserTransformer.paginate(rows, meta))` for a paginated list), anything else as a plain object (`serialize({ message })`). Never return a model or a bare object: a model reaches the frontend as `ModelObject` with no fields, and a bare object skips the `{ data }` envelope that `providers/api_provider.ts` gives every response.

Expected failures return through the response helpers (`return response.notFound({ message, key })`): the frontend can narrow them with `error.isStatus(404)`.

## Attachments

A file reaches a record in two requests: the frontend uploads it to `POST /api/v1/attachments`, then sends the returned `id` with the record's write. `users.avatar_attachment_id` is the reference example. A module that stores files:

1. **Depends on `attachments`** in `modules.json`.
2. **References it with a foreign key column named `*_attachment_id`** (or a join table with one), `references('id').inTable('attachments')`, with the default `ON DELETE`. A test fails on any `*_attachment_id` column without that FK, or with a cascading one.
3. **Lets the frontend upload first.** The upload endpoint accepts every type in `#attachments/rules`; the consumer narrows it.
4. **Claims in the same transaction as its write**: `new ClaimAttachments().handle(trx, { ids, uploaderId, rule })`, with a rule from `defineAttachmentRule({ extnames, maxSize })` and only the ids the record is newly adding. It throws a 422 `E_INVALID_ATTACHMENT` for an unknown id, another user's upload, or a file outside the rule.
5. **Embeds it through `AttachmentTransformer`**, which signs a one-hour URL. Load the relation first; whoever serializes the record has already authorized it.
6. **Drops the reference to remove a file.** Never delete attachments by hand: `node ace attachments:prune` deletes every attachment older than a day that no foreign key references, row and object. Schedule it (daily is enough); it is safe to run concurrently or after a crash.

## Health checks

Two endpoints, outside `/api/v1`:

- **`GET /health/live`** is the liveness probe for Docker (`HEALTHCHECK`) or an orchestrator. It answers 200 while the process serves HTTP and checks no dependency, so a database outage never turns into a restart loop.
- **`GET /health/ready`** is for monitoring. It requires the `x-monitoring-secret` header to equal `MONITORING_SECRET` (401 otherwise), runs every check in `start/health.ts`, and returns the report under `data`: 200 when every check passes, 503 when one fails. Each entry in `data.checks` carries its `name`, `status` (`ok`, `warning`, `error`), a `message` describing the result, and the measured values and thresholds in `meta`.

| Check                                | Fails when                                                                    | Thresholds (warn / fail) |
| ------------------------------------ | ----------------------------------------------------------------------------- | ------------------------ |
| `Disk space check`                   | Disk usage crosses the threshold; cached for an hour.                         | 75% / 80%                |
| `Memory heap check`                  | V8 heap in use crosses the threshold.                                         | 250 MB / 300 MB          |
| `Memory RSS check`                   | Resident memory of the process crosses the threshold.                         | 320 MB / 350 MB          |
| `Database health check (pg)`         | Postgres refuses the connection.                                              |                          |
| `Connection count health check (pg)` | Connections on the whole server (`pg_stat_activity`) cross.                   | 70 / 90                  |
| `Storage check`                      | The S3 bucket can't be listed (unreachable, bad credentials, missing bucket). |                          |

A new dependency the app can't serve without gets its own check, registered in `start/health.ts`; a custom one extends `BaseCheck` in `app/core/health_checks/`.

## Dependencies between modules

`apps/backend/modules.json` lists, per module, the other modules it may import. The lint enforces it (`no-restricted-imports`, generated in `oxlint.config.ts`), and the pre-commit hook runs that lint:

- A module imports itself, the modules listed for it, and `#start`, `#config`, `#database`, `#generated`. Its tests may also import `#tests`.
- Imports go through module aliases: `#app/*` and parent-relative paths (`../`) are rejected inside `app/`.
- A folder missing from `modules.json` can import no other module.

A new dependency is a reviewed decision: add it to `modules.json` in the same change, and never in a direction that would close a cycle. `core` depends on nothing.

## Naming feeds the generated registries

`indexEntities` (in `adonisrc.ts`) indexes `app/**/*_controller.ts` into `#generated/controllers`, grouped by module (`controllers.auth.AccessTokens`), and `app/**/*_transformer.ts` into the frontend's `Data` types (`Data.Users.User`). A file with another suffix is silently left out of both.

## Code conventions

- **Actions** (`actions/<verb>_<noun>.ts`): a default-exported class with one `async handle(input)`. `input` is a plain interface; never `HttpContext`. Return the primary value; throw the module's exceptions on expected failures. An action never calls another action: shared work becomes a service or a query.
- **Queries** (`queries/<verb>_<subject>.ts`): same shape as actions, read-only. One per business concept, not per screen.
- **Side effects through events**: mail, notifications, external HTTP, and anything another module reacts to are emitted as `<module>:<past_tense_verb>` events and handled in `start/events.ts`. Emit after the transaction commits, so listeners never see a rolled-back write.
- **Read-then-write races**: when a write derives a value from existing rows (next position, sequence number), lock the parent row with `forUpdate()` inside a transaction and back it with a `unique` constraint.
- **Transformers**: `toObject()` is the base shape; screen-specific shapes are variants named `for<Screen>` (`forList`, `forProfile`).
- **Validators**: one file per entity (`validators/<entity>.ts`), exporting one validator per use case.
