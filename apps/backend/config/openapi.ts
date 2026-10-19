import env from '#start/env'
import { defineConfig } from '@enzopita/adonisjs-openapi'

export default defineConfig({
  output: 'openapi.json',
  info: { title: env.get('APP_NAME'), version: '1.0.0' },
  securitySchemes: {
    accessToken: { type: 'http', scheme: 'bearer' },
  },
  middlewareSecurity: {
    auth: 'accessToken',
  },
})
