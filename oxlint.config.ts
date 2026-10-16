import { defineConfig } from 'oxlint'
import { julrPreset } from '@julr/tooling-configs/oxc/lint'

export default defineConfig({
  extends: [julrPreset({ adonisjs: true })],

  // TODO: remove once https://github.com/oxc-project/oxc/issues/10223 is fixed
  ignorePatterns: ['**/.adonisjs/**', 'node_modules/**', 'dist/**', 'build/**', '*.yml'],
})
