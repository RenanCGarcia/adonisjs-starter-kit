import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'
import { loginIpThrottle, signupThrottle } from '#start/limiter'

const { NewAccount, AccessTokens } = controllers.auth

apiRoutes(() => {
  router
    .group(() => {
      router.post('signup', [NewAccount, 'store']).use(signupThrottle)
      router.post('login', [AccessTokens, 'store']).use(loginIpThrottle)
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
