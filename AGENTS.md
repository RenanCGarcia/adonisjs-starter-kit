# Agent notes

- **Tests**: before writing, extending, or reviewing any test (unit, functional, e2e), read `docs/testing.md`: one owner layer per behavior, no duplicate coverage.
- **AdonisJS docs**: for any AdonisJS question, read the v7 docs in `repos/adonisjs-docs/content` (`start/`, `guides/`, `reference/`) before guessing or searching the web. If the folder is missing or empty, run `pnpm docs:pull` (also updates it). It's gitignored, so root-level Grep/Glob skip it: pass the path explicitly. Read-only: never edit or import from it.
