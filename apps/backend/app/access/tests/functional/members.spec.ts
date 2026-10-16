import { test } from '@japa/runner'
import type User from '#users/models/user'
import Tenant from '#tenancy/models/tenant'
import type { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import { assign, grant, member, role } from '#access/tests/seed'

async function setup() {
  const acme = await Tenant.create({ name: 'Acme' })
  const owner = await member(acme)
  await assign(owner, await role(acme, 'Owner', ['roles.manage', 'members.manage']))

  return { acme, owner }
}

function setRole(
  client: ApiClient,
  actor: User,
  tenant: Tenant,
  target: User,
  roleId: string | null,
) {
  return client
    .visit('access.member_roles.update', { userId: target.id })
    .json({ roleId })
    .header('X-Tenant-Id', tenant.id)
    .loginAs(actor)
}

function setGrants(
  client: ApiClient,
  actor: User,
  tenant: Tenant,
  target: User,
  permissions: ('roles.manage' | 'members.manage')[],
) {
  return client
    .visit('access.member_permissions.update', { userId: target.id })
    .json({ permissions })
    .header('X-Tenant-Id', tenant.id)
    .loginAs(actor)
}

async function permissionsOf(client: ApiClient, user: User, tenant: Tenant) {
  const response = await client
    .visit('access.my_permissions.show')
    .header('X-Tenant-Id', tenant.id)
    .loginAs(user)

  return response.body().data.permissions
}

test.group('Access | members', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('requires members.manage', async ({ client }) => {
    const { acme } = await setup()
    const roleManager = await member(acme)
    await grant(roleManager, acme, 'roles.manage')
    const target = await member(acme)

    const roleResponse = await setRole(client, roleManager, acme, target, null)
    const grantsResponse = await setGrants(client, roleManager, acme, target, [])

    roleResponse.assertStatus(403)
    grantsResponse.assertStatus(403)
  })

  test('replaces the role and the grants of a member', async ({ client, assert }) => {
    const { acme, owner } = await setup()
    const target = await member(acme)
    const editor = await role(acme, 'Editor', ['roles.manage'])
    const viewer = await role(acme, 'Viewer', [])

    await setRole(client, owner, acme, target, editor.id)
    assert.deepEqual(await permissionsOf(client, target, acme), ['roles.manage'])

    await setRole(client, owner, acme, target, viewer.id)
    await setGrants(client, owner, acme, target, ['roles.manage'])
    await setGrants(client, owner, acme, target, ['members.manage'])
    assert.deepEqual(await permissionsOf(client, target, acme), ['members.manage'])

    await setRole(client, owner, acme, target, null)
    await setGrants(client, owner, acme, target, [])
    assert.deepEqual(await permissionsOf(client, target, acme), [])
  })

  test('answers 404 for a user outside the tenant and 422 for a role of another', async ({
    client,
  }) => {
    const { acme, owner } = await setup()
    const globex = await Tenant.create({ name: 'Globex' })
    const outsider = await member(globex)
    const target = await member(acme)
    const viewer = await role(acme, 'Viewer', [])
    const auditor = await role(globex, 'Auditor', [])

    const outsiderRole = await setRole(client, owner, acme, outsider, viewer.id)
    const outsiderGrants = await setGrants(client, owner, acme, outsider, ['roles.manage'])
    const foreignRole = await setRole(client, owner, acme, target, auditor.id)

    outsiderRole.assertStatus(404)
    outsiderRole.assertBodyContains({ code: 'E_MEMBER_NOT_FOUND' })
    outsiderGrants.assertStatus(404)
    foreignRole.assertStatus(422)
  })

  test('refuses to leave the tenant without anyone able to manage members', async ({
    client,
    assert,
  }) => {
    const { acme, owner } = await setup()

    const alone = await setRole(client, owner, acme, owner, null)
    alone.assertStatus(409)
    alone.assertBodyContains({ code: 'E_LAST_MANAGER' })

    const deputy = await member(acme)
    await setGrants(client, owner, acme, deputy, ['members.manage'])
    const handedOver = await setRole(client, owner, acme, owner, null)
    handedOver.assertStatus(200)

    const lastGrant = await setGrants(client, deputy, acme, deputy, [])
    lastGrant.assertStatus(409)
    assert.deepEqual(await permissionsOf(client, deputy, acme), ['members.manage'])
  })
})
