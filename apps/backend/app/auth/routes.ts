import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const { NewAccount, AccessTokens } = controllers.auth

apiRoutes(() => {
  router
    .group(() => {
      router.post('signup', [NewAccount, 'store'])
      router.post('login', [AccessTokens, 'store'])
    })
    .prefix('auth')
    .as('auth')

  router
    .group(() => {
      router.post('logout', [AccessTokens, 'destroy'])
    })
    .prefix('account')
    .as('profile')
    .use(middleware.auth())
})
