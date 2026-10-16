import { defineConfig, type OxlintOverride } from 'oxlint'
import { julrPreset } from '@julr/tooling-configs/oxc/lint'
import backendModules from './apps/backend/modules.json' with { type: 'json' }

const BACKEND_APP = 'apps/backend/app'

// Aliases outside app/ that any module may import.
const SHARED_ALIASES = ['#start', '#config', '#database', '#generated']

function restrictImports(files: string, allowed: string[], message: string): OxlintOverride {
  return {
    files: [files],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['#*/**', ...allowed.map(alias => `!${alias}/**`)], message },
            {
              group: ['../**'],
              message:
                'Import through the module alias (#<module>/...) instead of a parent-relative path.',
            },
          ],
        },
      ],
    },
  }
}

const moduleBoundaries = [
  restrictImports(
    `${BACKEND_APP}/**`,
    SHARED_ALIASES,
    'This folder is not a registered module: add it to apps/backend/modules.json (node ace make:module does it).',
  ),
  ...Object.entries(backendModules).flatMap(([name, deps]: [string, string[]]) => {
    const allowed = [`#${name}`, ...SHARED_ALIASES, ...deps.map(dep => `#${dep}`)]
    const message = `Module "${name}" may import ${deps.join(', ') || 'no other module'}. A new dependency goes in apps/backend/modules.json first.`
    return [
      restrictImports(`${BACKEND_APP}/${name}/**`, allowed, message),
      restrictImports(`${BACKEND_APP}/${name}/tests/**`, [...allowed, '#tests'], message),
    ]
  }),
]

const designSystem: OxlintOverride[] = [
  {
    files: ['apps/frontend/src/**', 'packages/ui/src/**'],
    rules: {
      'shadcn/no-restyle': ['error', { allow: ['layout'] }],
      'shadcn/no-raw-colors': 'error',
      'shadcn/no-arbitrary-values': ['error', { allow: ['layout'] }],
      'shadcn/no-inline-styles': 'error',
      'shadcn/require-static-classes': 'error',
      'shadcn/no-unknown-classes': 'error',
    },
  },
  {
    // Components own their appearance and may need structural values such as ring-[3px].
    files: ['packages/ui/src/components/**'],
    rules: {
      'shadcn/no-restyle': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/require-static-classes': 'off',
    },
  },
]

export default defineConfig({
  extends: [julrPreset({ adonisjs: true })],
  jsPlugins: ['@shadcn/lint'],

  // TODO: remove once https://github.com/oxc-project/oxc/issues/10223 is fixed
  ignorePatterns: ['**/.adonisjs/**', 'node_modules/**', 'dist/**', 'build/**', '*.yml'],

  overrides: [...moduleBoundaries, ...designSystem],
})
