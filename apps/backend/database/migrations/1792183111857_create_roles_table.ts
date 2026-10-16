import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'roles'

  override async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().defaultTo(this.raw('uuidv7()'))
      table.uuid('tenant_id').nullable().references('id').inTable('tenants').onDelete('CASCADE')
      // Postgres treats NULLs as distinct in unique indexes and skips foreign keys with a NULL
      // column, so platform roles (no tenant) key on the nil uuid instead.
      table.specificType(
        'tenant_key',
        `uuid GENERATED ALWAYS AS (COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000')) STORED`,
      )
      table.string('name').notNullable()
      table.specificType('permissions', 'text[]').notNullable().defaultTo('{}')
      table.unique(['tenant_key', 'name'])
      table.unique(['id', 'tenant_key'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
