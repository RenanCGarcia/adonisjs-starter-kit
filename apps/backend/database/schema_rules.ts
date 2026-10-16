import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    roles: {
      columns: { permissions: { decorators: [{ name: '@column' }], tsType: 'string[]' } },
      skipColumns: ['tenant_key'],
    },
    role_assignments: { skipColumns: ['tenant_key'] },
    permission_grants: { skipColumns: ['tenant_key'] },
  },
} satisfies SchemaRules
