import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const { Profile } = controllers.users

apiRoutes(() => {
  router
    .group(() => {
      router.get('profile', [Profile, 'show'])
    })
    .prefix('account')
    .as('profile')
    .use(middleware.auth())
})
