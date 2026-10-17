import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiRoutes } from '#core/api_routes'
import { controllers } from '#generated/controllers'

const {
  MyPermissions,
  PermissionCatalog,
  Roles,
  Members,
  MemberRoles,
  MemberPermissions,
  Invitations,
  InvitationAccept,
} = controllers.access

apiRoutes(() => {
  router
    .group(() => {
      router.get('access/me', [MyPermissions, 'show'])
      router.get('access/permissions', [PermissionCatalog, 'show'])

      router.get('roles', [Roles, 'index'])
      router.post('roles', [Roles, 'store'])
      router.put('roles/:id', [Roles, 'update']).where('id', router.matchers.uuid())
      router.delete('roles/:id', [Roles, 'destroy']).where('id', router.matchers.uuid())

      router.get('members', [Members, 'index'])
      router
        .put('members/:userId/role', [MemberRoles, 'update'])
        .where('userId', router.matchers.uuid())
      router
        .put('members/:userId/permissions', [MemberPermissions, 'update'])
        .where('userId', router.matchers.uuid())

      router.get('invitations', [Invitations, 'index'])
      router.post('invitations', [Invitations, 'store'])
      router.delete('invitations/:id', [Invitations, 'destroy']).where('id', router.matchers.uuid())
    })
    .as('access')
    .use([middleware.auth(), middleware.tenant()])

  router.post('invitations/accept', [InvitationAccept, 'store']).use(middleware.auth())
})
