import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    roles: { columns: { permissions: { decorators: [{ name: '@column' }], tsType: 'string[]' } } },
    user_tokens: {
      columns: {
        purpose: {
          decorators: [{ name: '@column' }],
          tsType: "'password_reset' | 'email_verification'",
        },
      },
    },
  },
} satisfies SchemaRules
