import { test } from '@japa/runner'
import Role from '#access/models/role'
import Tenant from '#tenancy/models/tenant'
import { member, role } from '#access/tests/seed'
import emitter from '@adonisjs/core/services/emitter'
import RoleAssignment from '#access/models/role_assignment'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Access | tenant owner', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('makes the creator of a tenant its Owner, once', async ({ client, assert }) => {
    const acme = await Tenant.create({ name: 'Acme' })
    const founder = await member(acme)

    await emitter.emit('tenancy:tenant_created', { tenantId: acme.id, creatorId: founder.id })
    await emitter.emit('tenancy:tenant_created', { tenantId: acme.id, creatorId: founder.id })

    const response = await client
      .visit('access.my_permissions.show')
      .header('X-Tenant-Id', acme.id)
      .loginAs(founder)

    assert.deepEqual(response.body().data.permissions, ['roles.manage', 'members.manage'])
    assert.lengthOf(await Role.query().where('tenant_id', acme.id), 1)
    assert.lengthOf(await RoleAssignment.query().where('tenant_id', acme.id), 1)
  })

  test('assigns an Owner role left by an interrupted run', async ({ assert }) => {
    const acme = await Tenant.create({ name: 'Acme' })
    const founder = await member(acme)
    const owner = await role(acme, 'Owner', ['roles.manage', 'members.manage'])

    await emitter.emit('tenancy:tenant_created', { tenantId: acme.id, creatorId: founder.id })

    const assignment = await RoleAssignment.query().where('user_id', founder.id).firstOrFail()
    assert.equal(assignment.roleId, owner.id)
  })
})
