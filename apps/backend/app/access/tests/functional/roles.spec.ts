import { test } from '@japa/runner'
import Role from '#access/models/role'
import { workspace } from '#access/tests/seed'
import testUtils from '@adonisjs/core/services/test_utils'

async function setup() {
  const acme = await workspace()
  const owner = await acme.member()
  const ownerRole = await acme.role('Owner', ['roles.manage', 'members.manage'])
  await acme.assign(owner, ownerRole)

  return { acme, owner, ownerRole }
}

test.group('Access | roles', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('requires roles.manage', async ({ client }) => {
    const { acme } = await setup()
    const plain = await acme.member()
    const editor = await acme.role('Editor', [])

    const responses = [
      await client.visit('access.roles.index').headers(acme.headers).loginAs(plain),
      await client
        .visit('access.roles.store')
        .json({ name: 'New', permissions: [] })
        .headers(acme.headers)
        .loginAs(plain),
      await client
        .visit('access.roles.update', { id: editor.id })
        .json({ name: 'Renamed', permissions: [] })
        .headers(acme.headers)
        .loginAs(plain),
      await client
        .visit('access.roles.destroy', { id: editor.id })
        .headers(acme.headers)
        .loginAs(plain),
    ]

    for (const response of responses) response.assertStatus(403)
  })

  test('creates, lists and updates roles', async ({ client, assert }) => {
    const { acme, owner } = await setup()

    const created = await client
      .visit('access.roles.store')
      .json({ name: 'Editor', permissions: ['roles.manage'] })
      .headers(acme.headers)
      .loginAs(owner)

    created.assertStatus(200)

    const updated = await client
      .visit('access.roles.update', { id: created.body().data.id })
      .json({ name: 'Writer', permissions: ['members.manage'] })
      .headers(acme.headers)
      .loginAs(owner)

    updated.assertStatus(200)

    const listed = await client.visit('access.roles.index').headers(acme.headers).loginAs(owner)

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

  test('rejects a name already taken and permissions it may not grant', async ({
    client,
    assert,
  }) => {
    const { acme, owner } = await setup()

    const store = (name: string, permissions: string[]) =>
      client.post('/api/v1/roles').json({ name, permissions }).headers(acme.headers).loginAs(owner)

    const statuses = [
      await store('Owner', []),
      await store('Admin', ['platform.admin']),
      await store('Reporter', ['reports.export']),
      await store('Editor', ['roles.manage']),
    ].map(response => response.status())

    assert.deepEqual(statuses, [422, 422, 422, 200])
  })

  test('deletes a role only once nobody holds it', async ({ client, assert }) => {
    const { acme, owner } = await setup()
    const editor = await acme.role('Editor', [])
    const assignment = await acme.assign(await acme.member(), editor)

    const destroy = () =>
      client.visit('access.roles.destroy', { id: editor.id }).headers(acme.headers).loginAs(owner)

    const refused = await destroy()
    refused.assertStatus(409)
    refused.assertBodyContains({ code: 'E_ROLE_IN_USE' })

    await assignment.delete()
    const deleted = await destroy()
    deleted.assertStatus(200)
    assert.isNull(await Role.find(editor.id))
  })

  test('keeps members.manage on the role of the last manager', async ({ client, assert }) => {
    const { acme, owner, ownerRole } = await setup()

    const update = () =>
      client
        .visit('access.roles.update', { id: ownerRole.id })
        .json({ name: 'Owner', permissions: ['roles.manage'] })
        .headers(acme.headers)
        .loginAs(owner)

    const refused = await update()
    refused.assertStatus(409)
    refused.assertBodyContains({ code: 'E_LAST_MANAGER' })
    assert.deepEqual((await ownerRole.refresh()).permissions, ['roles.manage', 'members.manage'])

    await acme.grant(await acme.member(), 'members.manage')
    const handedOver = await update()
    handedOver.assertStatus(200)
  })
})
