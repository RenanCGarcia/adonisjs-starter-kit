import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    roles: { columns: { permissions: { decorators: [{ name: '@column' }], tsType: 'string[]' } } },
  },
} satisfies SchemaRules
