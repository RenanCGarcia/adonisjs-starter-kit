import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_assignments'

  override async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().defaultTo(this.raw('uuidv7()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('tenant_id').nullable()
      table.specificType(
        'tenant_key',
        `uuid GENERATED ALWAYS AS (COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000')) STORED`,
      )
      table.uuid('role_id').notNullable()
      table.unique(['user_id', 'tenant_key'])
      // The role belongs to the same tenant (or is a platform role for a platform row), and
      // can't be deleted while assigned: no ON DELETE, checked at the end of the statement so
      // deleting a tenant still cascades through its roles and assignments together.
      table.foreign(['role_id', 'tenant_key']).references(['id', 'tenant_key']).inTable('roles')
      table
        .foreign(['tenant_id', 'user_id'])
        .references(['tenant_id', 'user_id'])
        .inTable('tenant_memberships')
        .onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
