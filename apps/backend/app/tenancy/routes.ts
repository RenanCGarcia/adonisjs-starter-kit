import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const { Tenants } = controllers.tenancy

apiRoutes(() => {
  router
    .group(() => {
      router.get('/', [Tenants, 'index'])
      router.post('/', [Tenants, 'store'])
    })
    .prefix('tenants')
    .as('tenants')
    .use(middleware.auth())
})
