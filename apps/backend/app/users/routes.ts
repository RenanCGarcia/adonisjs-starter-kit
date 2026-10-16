import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const { Profile, Avatar } = controllers.users

apiRoutes(() => {
  router
    .group(() => {
      router.get('profile', [Profile, 'show'])
      router.put('avatar', [Avatar, 'update'])
    })
    .prefix('account')
    .as('profile')
    .use(middleware.auth())
})
