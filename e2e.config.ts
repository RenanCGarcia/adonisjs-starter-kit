import type { E2EConfig } from 'e2e'
import { web } from '@e2e-dev/web'
import { anthropic } from '@ai-sdk/anthropic'
import { existsSync } from 'node:fs'

// Local secrets such as ANTHROPIC_API_KEY; CI sets them in the environment instead.
if (existsSync('.env')) process.loadEnvFile('.env')

export default {
  // agent.* steps need ANTHROPIC_API_KEY (not set up yet): put it in a root .env or the environment.
  // With Claude Max/Team: link a Claude Console org in claude.ai > Billing and create the key there.
  // Without it, tests/auth.e2e.ts fails at its logout step with MODEL_PROVIDER_FAILED.
  agents: {
    default: {
      model: anthropic('claude-haiku-4-5'),
      system: 'You are a thorough QA agent. Verify every outcome.',
    },
  },
  targets: [
    {
      engine: web(),
      app: {
        url: 'http://localhost:5173',
        readyUrl: 'http://localhost:3333/',
        command: {
          executable: 'pnpm',
          args: ['exec', 'turbo', 'run', 'dev', '--ui=stream'],
          startupTimeout: 120_000,
          log: '.e2e/logs/app.log',
        },
      },
    },
  ],
} satisfies E2EConfig
