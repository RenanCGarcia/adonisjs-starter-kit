import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  async live({ serialize }: HttpContext) {
    return serialize({ status: 'ok' as const })
  }

  async ready({ response, serialize }: HttpContext) {
    const report = await healthChecks.run()

    if (!report.isHealthy) {
      return response.serviceUnavailable(await serialize(report))
    }

    return serialize(report)
  }
}
