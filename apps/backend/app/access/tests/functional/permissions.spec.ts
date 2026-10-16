import { test } from '@japa/runner'
import type { ApiClient } from '@japa/api-client'
import type User from '#users/models/user'
import Tenant from '#tenancy/models/tenant'
import testUtils from '@adonisjs/core/services/test_utils'
import { assign, grant, member, role } from '#access/tests/seed'

test.group('Access | effective permissions', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const permissionsIn = async (client: ApiClient, user: User, tenant: Tenant) => {
    const response = await client
      .visit('access.my_permissions.show')
      .header('X-Tenant-Id', tenant.id)
      .loginAs(user)

    response.assertStatus(200)

    return response.body().data.permissions
  }

  test('joins the role and the grants of the current tenant only', async ({ client, assert }) => {
    const acme = await Tenant.create({ name: 'Acme' })
    const globex = await Tenant.create({ name: 'Globex' })
    const user = await member(acme, globex)
    await assign(user, await role(acme, 'Editor', ['roles.manage']))
    await grant(user, acme, 'members.manage')
    await assign(user, await role(globex, 'Viewer', []))
    await grant(user, globex, 'roles.manage')

    assert.deepEqual(await permissionsIn(client, user, acme), ['roles.manage', 'members.manage'])
    assert.deepEqual(await permissionsIn(client, user, globex), ['roles.manage'])
  })

  test('ignores permissions the catalog no longer lists', async ({ client, assert }) => {
    const acme = await Tenant.create({ name: 'Acme' })
    const user = await member(acme)
    await assign(user, await role(acme, 'Legacy', ['reports.export', 'roles.manage']))
    await grant(user, acme, 'invoices.void')

    assert.deepEqual(await permissionsIn(client, user, acme), ['roles.manage'])
  })

  test('gives a platform admin every permission in any tenant', async ({ client, assert }) => {
    const acme = await Tenant.create({ name: 'Acme' })
    const admin = await member(acme)
    await assign(admin, await role(null, 'Admin', ['platform.admin']))

    assert.deepEqual(await permissionsIn(client, admin, acme), [
      'roles.manage',
      'members.manage',
      'platform.admin',
    ])
  })
})
