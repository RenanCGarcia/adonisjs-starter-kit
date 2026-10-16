import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const { Attachments } = controllers.attachments

apiRoutes(() => {
  router
    .group(() => {
      router.post('/', [Attachments, 'store'])
    })
    .prefix('attachments')
    .as('attachments')
    .use(middleware.auth())
})
