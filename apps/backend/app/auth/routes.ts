import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'
import {
  emailVerificationResendThrottle,
  emailVerifyThrottle,
  loginIpThrottle,
  passwordForgotEmailThrottle,
  passwordForgotIpThrottle,
  passwordResetThrottle,
  signupThrottle,
} from '#start/limiter'

const { NewAccount, AccessTokens, Sessions, PasswordResets, EmailVerifications } = controllers.auth

apiRoutes(() => {
  router
    .group(() => {
      router.post('signup', [NewAccount, 'store']).use(signupThrottle)
      router.post('login', [AccessTokens, 'store']).use(loginIpThrottle)
      router
        .post('password/forgot', [PasswordResets, 'store'])
        .use([passwordForgotIpThrottle, passwordForgotEmailThrottle])
      router.post('password/reset', [PasswordResets, 'update']).use(passwordResetThrottle)
      router.post('email/verify', [EmailVerifications, 'update']).use(emailVerifyThrottle)
    })
    .prefix('auth')
    .as('auth')

  router
    .group(() => {
      router.post('logout', [AccessTokens, 'destroy'])
      router.get('sessions', [Sessions, 'index'])
      router.delete('sessions/:id', [Sessions, 'destroy'])
      router.delete('sessions', [Sessions, 'destroyAll'])
      router
        .post('email/verification', [EmailVerifications, 'store'])
        .use(emailVerificationResendThrottle)
    })
    .prefix('account')
    .as('profile')
    .use(middleware.auth())
})
