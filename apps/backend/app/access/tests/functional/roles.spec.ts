import { test } from '@japa/runner'
import Role from '#access/models/role'
import Tenant from '#tenancy/models/tenant'
import testUtils from '@adonisjs/core/services/test_utils'
import { assign, grant, member, role } from '#access/tests/seed'

async function setup() {
  const acme = await Tenant.create({ name: 'Acme' })
  const globex = await Tenant.create({ name: 'Globex' })
  const owner = await member(acme)
  await assign(owner, await role(acme, 'Owner', ['roles.manage', 'members.manage']))

  return { acme, globex, owner }
}

test.group('Access | roles', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('requires roles.manage', async ({ client }) => {
    const { acme } = await setup()
    const plain = await member(acme)
    const editor = await role(acme, 'Editor', [])

    const responses = await Promise.all([
      client.visit('access.roles.index').header('X-Tenant-Id', acme.id).loginAs(plain),
      client
        .visit('access.roles.store')
        .json({ name: 'New', permissions: [] })
        .header('X-Tenant-Id', acme.id)
        .loginAs(plain),
      client
        .visit('access.roles.update', { id: editor.id })
        .json({ name: 'Renamed', permissions: [] })
        .header('X-Tenant-Id', acme.id)
        .loginAs(plain),
      client
        .visit('access.roles.destroy', { id: editor.id })
        .header('X-Tenant-Id', acme.id)
        .loginAs(plain),
    ])

    for (const response of responses) response.assertStatus(403)
  })

  test('creates, lists and updates the roles of the current tenant', async ({ client, assert }) => {
    const { acme, globex, owner } = await setup()
    await role(globex, 'Auditor', [])

    const created = await client
      .visit('access.roles.store')
      .json({ name: 'Editor', permissions: ['roles.manage'] })
      .header('X-Tenant-Id', acme.id)
      .loginAs(owner)

    created.assertStatus(200)

    const updated = await client
      .visit('access.roles.update', { id: created.body().data.id })
      .json({ name: 'Writer', permissions: ['members.manage'] })
      .header('X-Tenant-Id', acme.id)
      .loginAs(owner)

    updated.assertStatus(200)

    const listed = await client
      .visit('access.roles.index')
      .header('X-Tenant-Id', acme.id)
      .loginAs(owner)

    assert.deepEqual(
      listed
        .body()
        .data.map((row: { name: string; permissions: string[] }) => [row.name, row.permissions]),
      [
        ['Owner', ['roles.manage', 'members.manage']],
        ['Writer', ['members.manage']],
      ],
    )
  })

  test('answers 404 for a role of another tenant', async ({ client, assert }) => {
    const { acme, globex, owner } = await setup()
    const auditor = await role(globex, 'Auditor', [])

    const updated = await client
      .visit('access.roles.update', { id: auditor.id })
      .json({ name: 'Hijacked', permissions: ['roles.manage'] })
      .header('X-Tenant-Id', acme.id)
      .loginAs(owner)

    const deleted = await client
      .visit('access.roles.destroy', { id: auditor.id })
      .header('X-Tenant-Id', acme.id)
      .loginAs(owner)

    updated.assertStatus(404)
    deleted.assertStatus(404)
    assert.deepEqual((await Role.findOrFail(auditor.id)).permissions, [])
  })

  test('rejects a name taken in the tenant and permissions it may not grant', async ({
    client,
    assert,
  }) => {
    const { acme, globex, owner } = await setup()
    await role(globex, 'Editor', [])
    await role(null, 'Support', [])

    const store = (name: string, permissions: string[]) =>
      client
        .post('/api/v1/roles')
        .json({ name, permissions })
        .header('X-Tenant-Id', acme.id)
        .loginAs(owner)

    const statuses = [
      await store('Owner', []),
      await store('Admin', ['platform.admin']),
      await store('Reporter', ['reports.export']),
      await store('Editor', []),
      await store('Support', []),
    ].map(response => response.status())

    assert.deepEqual(statuses, [422, 422, 422, 200, 200])
  })

  test('deletes a role only once nobody holds it', async ({ client, assert }) => {
    const { acme, owner } = await setup()
    const editor = await role(acme, 'Editor', [])
    const assignment = await assign(await member(acme), editor)

    const destroy = () =>
      client
        .visit('access.roles.destroy', { id: editor.id })
        .header('X-Tenant-Id', acme.id)
        .loginAs(owner)

    const refused = await destroy()
    refused.assertStatus(409)
    refused.assertBodyContains({ code: 'E_ROLE_IN_USE' })

    await assignment.delete()
    const deleted = await destroy()
    deleted.assertStatus(200)
    assert.isNull(await Role.find(editor.id))
  })

  test('keeps members.manage on the role of the last manager', async ({ client, assert }) => {
    const { acme, owner } = await setup()
    const ownerRole = await Role.findByOrFail('name', 'Owner')

    const update = () =>
      client
        .visit('access.roles.update', { id: ownerRole.id })
        .json({ name: 'Owner', permissions: ['roles.manage'] })
        .header('X-Tenant-Id', acme.id)
        .loginAs(owner)

    const refused = await update()
    refused.assertStatus(409)
    refused.assertBodyContains({ code: 'E_LAST_MANAGER' })
    assert.deepEqual((await ownerRole.refresh()).permissions, ['roles.manage', 'members.manage'])

    await grant(await member(acme), acme, 'members.manage')
    const handedOver = await update()
    handedOver.assertStatus(200)
  })
})
