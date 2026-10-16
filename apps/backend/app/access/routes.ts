import router from '@adonisjs/core/services/router'
import { apiRoutes } from '#core/api_routes'

apiRoutes(() => {
  router
    .group(() => {})
    .prefix('access')
    .as('access')
})
