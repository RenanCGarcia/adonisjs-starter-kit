import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const { MyPermissions, Roles } = controllers.access

apiRoutes(() => {
  router
    .group(() => {
      router.get('access/me', [MyPermissions, 'show'])

      router.get('roles', [Roles, 'index'])
      router.post('roles', [Roles, 'store'])
      router.put('roles/:id', [Roles, 'update']).where('id', router.matchers.uuid())
      router.delete('roles/:id', [Roles, 'destroy']).where('id', router.matchers.uuid())
    })
    .as('access')
    .use([middleware.auth(), middleware.tenant()])
})
