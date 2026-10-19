import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.profile.update': { paramsTuple?: []; params?: {} }
    'profile.avatar.update': { paramsTuple?: []; params?: {} }
    'attachments.attachments.store': { paramsTuple?: []; params?: {} }
    'tenants.tenants.index': { paramsTuple?: []; params?: {} }
    'tenants.tenants.store': { paramsTuple?: []; params?: {} }
    'audit.audit_events.index': { paramsTuple?: []; params?: {} }
    'audit.account_activity.index': { paramsTuple?: []; params?: {} }
    'admin.me.show': { paramsTuple?: []; params?: {} }
    'admin.tenants.index': { paramsTuple?: []; params?: {} }
    'admin.tenants.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tenants.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tenant_suspensions.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tenant_suspensions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.user_suspensions.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.user_suspensions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.impersonations.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.two_factor_resets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.platform_admins.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.platform_admins.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
    'openapi.ui': { paramsTuple?: []; params?: {} }
    'openapi.document': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'auth.two_factor_logins.store': { paramsTuple?: []; params?: {} }
    'auth.password_resets.store': { paramsTuple?: []; params?: {} }
    'auth.password_resets.update': { paramsTuple?: []; params?: {} }
    'auth.email_verifications.update': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'profile.sessions.index': { paramsTuple?: []; params?: {} }
    'profile.sessions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.sessions.destroy_all': { paramsTuple?: []; params?: {} }
    'profile.email_verifications.store': { paramsTuple?: []; params?: {} }
    'profile.two_factor.show': { paramsTuple?: []; params?: {} }
    'profile.two_factor.store': { paramsTuple?: []; params?: {} }
    'profile.two_factor.confirm': { paramsTuple?: []; params?: {} }
    'profile.two_factor.destroy': { paramsTuple?: []; params?: {} }
    'profile.two_factor.regenerate_recovery_codes': { paramsTuple?: []; params?: {} }
    'access.my_permissions.show': { paramsTuple?: []; params?: {} }
    'access.permission_catalog.show': { paramsTuple?: []; params?: {} }
    'access.roles.index': { paramsTuple?: []; params?: {} }
    'access.roles.store': { paramsTuple?: []; params?: {} }
    'access.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'access.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'access.members.index': { paramsTuple?: []; params?: {} }
    'access.member_roles.update': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'access.member_permissions.update': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'access.invitations.index': { paramsTuple?: []; params?: {} }
    'access.invitations.store': { paramsTuple?: []; params?: {} }
    'access.invitations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invitation_accept.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'tenants.tenants.index': { paramsTuple?: []; params?: {} }
    'audit.audit_events.index': { paramsTuple?: []; params?: {} }
    'audit.account_activity.index': { paramsTuple?: []; params?: {} }
    'admin.me.show': { paramsTuple?: []; params?: {} }
    'admin.tenants.index': { paramsTuple?: []; params?: {} }
    'admin.tenants.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
    'openapi.ui': { paramsTuple?: []; params?: {} }
    'openapi.document': { paramsTuple?: []; params?: {} }
    'profile.sessions.index': { paramsTuple?: []; params?: {} }
    'profile.two_factor.show': { paramsTuple?: []; params?: {} }
    'access.my_permissions.show': { paramsTuple?: []; params?: {} }
    'access.permission_catalog.show': { paramsTuple?: []; params?: {} }
    'access.roles.index': { paramsTuple?: []; params?: {} }
    'access.members.index': { paramsTuple?: []; params?: {} }
    'access.invitations.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'tenants.tenants.index': { paramsTuple?: []; params?: {} }
    'audit.audit_events.index': { paramsTuple?: []; params?: {} }
    'audit.account_activity.index': { paramsTuple?: []; params?: {} }
    'admin.me.show': { paramsTuple?: []; params?: {} }
    'admin.tenants.index': { paramsTuple?: []; params?: {} }
    'admin.tenants.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
    'openapi.ui': { paramsTuple?: []; params?: {} }
    'openapi.document': { paramsTuple?: []; params?: {} }
    'profile.sessions.index': { paramsTuple?: []; params?: {} }
    'profile.two_factor.show': { paramsTuple?: []; params?: {} }
    'access.my_permissions.show': { paramsTuple?: []; params?: {} }
    'access.permission_catalog.show': { paramsTuple?: []; params?: {} }
    'access.roles.index': { paramsTuple?: []; params?: {} }
    'access.members.index': { paramsTuple?: []; params?: {} }
    'access.invitations.index': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'profile.profile.update': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profile.avatar.update': { paramsTuple?: []; params?: {} }
    'admin.tenants.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'access.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'access.member_roles.update': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'access.member_permissions.update': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
  }
  POST: {
    'attachments.attachments.store': { paramsTuple?: []; params?: {} }
    'tenants.tenants.store': { paramsTuple?: []; params?: {} }
    'admin.tenant_suspensions.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.user_suspensions.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.impersonations.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.platform_admins.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'auth.two_factor_logins.store': { paramsTuple?: []; params?: {} }
    'auth.password_resets.store': { paramsTuple?: []; params?: {} }
    'auth.password_resets.update': { paramsTuple?: []; params?: {} }
    'auth.email_verifications.update': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'profile.email_verifications.store': { paramsTuple?: []; params?: {} }
    'profile.two_factor.store': { paramsTuple?: []; params?: {} }
    'profile.two_factor.confirm': { paramsTuple?: []; params?: {} }
    'profile.two_factor.regenerate_recovery_codes': { paramsTuple?: []; params?: {} }
    'access.roles.store': { paramsTuple?: []; params?: {} }
    'access.invitations.store': { paramsTuple?: []; params?: {} }
    'invitation_accept.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'admin.tenant_suspensions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.user_suspensions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.two_factor_resets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.platform_admins.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.sessions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.sessions.destroy_all': { paramsTuple?: []; params?: {} }
    'profile.two_factor.destroy': { paramsTuple?: []; params?: {} }
    'access.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'access.invitations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}