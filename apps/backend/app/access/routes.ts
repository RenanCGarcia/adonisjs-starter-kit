import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const { MyPermissions } = controllers.access

apiRoutes(() => {
  router
    .group(() => {
      router.get('access/me', [MyPermissions, 'show'])
    })
    .as('access')
    .use([middleware.auth(), middleware.tenant()])
})
