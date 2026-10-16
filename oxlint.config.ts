import { defineConfig } from 'oxlint'
import { julrPreset } from '@julr/tooling-configs/oxc/lint'
import backendModules from './apps/backend/modules.json' with { type: 'json' }

const BACKEND_APP = 'apps/backend/app'

// Aliases outside app/ that any module may import.
const SHARED_ALIASES = ['#start', '#config', '#database', '#generated']

/**
 * Module boundaries for apps/backend/app: a module imports only itself, the
 * modules listed for it in apps/backend/modules.json, and SHARED_ALIASES. An
 * allowlist, so a module missing from modules.json can import no other module.
 */
function moduleBoundary(name: string, allowed: string[], extraAliases: string[] = []) {
  const aliases = [...SHARED_ALIASES, ...extraAliases, ...allowed.map(dep => `#${dep}`)]
  const list = allowed.length > 0 ? allowed.join(', ') : 'no other module'
  const message = name
    ? `Module "${name}" may import ${list}. A new dependency goes in apps/backend/modules.json first.`
    : 'This folder is not a registered module: add it to apps/backend/modules.json (node ace make:module does it).'
  return [
    'error',
    {
      patterns: [
        {
          group: ['#*/**', ...[`#${name}`, ...aliases].map(alias => `!${alias}/**`)],
          message,
        },
        {
          group: ['../**'],
          message:
            'Import through the module alias (#<module>/...) instead of a parent-relative path.',
        },
      ],
    },
  ] as const
}

export default defineConfig({
  extends: [julrPreset({ adonisjs: true })],

  // TODO: remove once https://github.com/oxc-project/oxc/issues/10223 is fixed
  ignorePatterns: ['**/.adonisjs/**', 'node_modules/**', 'dist/**', 'build/**', '*.yml'],

  overrides: [
    {
      files: [`${BACKEND_APP}/**`],
      rules: { 'no-restricted-imports': moduleBoundary('', []) },
    },
    ...Object.entries(backendModules).flatMap(([name, allowed]) => [
      {
        files: [`${BACKEND_APP}/${name}/**`],
        rules: { 'no-restricted-imports': moduleBoundary(name, allowed) },
      },
      {
        files: [`${BACKEND_APP}/${name}/tests/**`],
        rules: { 'no-restricted-imports': moduleBoundary(name, allowed, ['#tests']) },
      },
    ]),
  ],
})
