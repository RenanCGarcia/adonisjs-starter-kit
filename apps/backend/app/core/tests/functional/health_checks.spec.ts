import { test } from '@japa/runner'
import env from '#start/env'

test.group('Core | health checks', () => {
  test('rejects a readiness probe without the monitoring secret', async ({ client }) => {
    const response = await client.get('/health/ready').header('x-monitoring-secret', 'wrong')

    response.assertStatus(401)
  })

  test('reports every indicator to a probe with the monitoring secret', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/health/ready')
      .header('x-monitoring-secret', env.get('MONITORING_SECRET').release())

    response.assertStatus(200)
    assert.deepEqual(
      response.body().data.checks.map((check: { name: string }) => check.name),
      [
        'Disk space check',
        'Memory heap check',
        'Memory RSS check',
        'Database health check (pg)',
        'Connection count health check (pg)',
        'Storage check',
        'Redis health check (main)',
      ],
    )
  })
})
