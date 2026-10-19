import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import env from '#start/env'
import { safeEqual } from '@adonisjs/core/helpers'
import { controllers } from '#generated/controllers'
import { openapiRoutes } from '@enzopita/adonisjs-openapi/routes'

const { HealthChecks } = controllers.core

router.where('id', router.matchers.uuid())

router.get('/', () => {
  return { hello: 'world' }
})

router.get('/health/live', [HealthChecks, 'live'])

router.get('/health/ready', [HealthChecks, 'ready']).use(({ request, response, i18n }, next) => {
  const secret = request.header('x-monitoring-secret') ?? ''

  if (safeEqual(secret, env.get('MONITORING_SECRET').release())) {
    return next()
  }

  return response.unauthorized({ message: i18n.t('errors.E_UNAUTHORIZED_ACCESS') })
})

// Generated live from the TypeScript sources, which a production build does not ship.
if (!app.inProduction) openapiRoutes()
