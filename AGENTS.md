# Agent notes

- **Tests**: before writing, extending, or reviewing any test (unit, functional, e2e), read `docs/testing.md`: one owner layer per behavior, no duplicate coverage.
- **AdonisJS docs**: for any AdonisJS question, read the v7 docs in `repos/adonisjs-docs/content` (`start/`, `guides/`, `reference/`) before guessing or searching the web. If the folder is missing or empty, run `pnpm docs:pull` (also updates it). It's gitignored, so root-level Grep/Glob skip it: pass the path explicitly. Read-only: never edit or import from it.
- **Lucid docs**: for any Lucid (ORM, query builder, migrations, factories) question, start with `repos/lucid-docs/docs/AI-REFERENCE-OVERVIEW.md`, then the topic file (`AI-REFERENCE-ORM.md`, `-MIGRATIONS.md`...). Same rules as the AdonisJS docs: `pnpm docs:pull` if missing, pass the path explicitly, read-only.
- **VineJS docs**: for any validation question, read `repos/vinejs-docs/content/docs` (`guides/`, `types/`, `extend/`). Same rules as the AdonisJS docs: `pnpm docs:pull` if missing, pass the path explicitly, read-only.
