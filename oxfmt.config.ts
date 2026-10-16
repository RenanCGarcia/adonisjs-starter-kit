import { julrPreset } from '@julr/tooling-configs/oxc/fmt'

const preset = julrPreset()

export default {
  ...preset,
  ignorePatterns: [
    ...(preset.ignorePatterns ?? []),
    // Rewritten by tools: `e2e init` (skill) and the e2e runner (replay cache).
    '.agents/skills/e2e/**',
    '.e2e/**',
  ],
}
