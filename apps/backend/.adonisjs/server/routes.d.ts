import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.avatar.update': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'attachments.attachments.store': { paramsTuple?: []; params?: {} }
    'tenants.tenants.index': { paramsTuple?: []; params?: {} }
    'tenants.tenants.store': { paramsTuple?: []; params?: {} }
    'access.my_permissions.show': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'tenants.tenants.index': { paramsTuple?: []; params?: {} }
    'access.my_permissions.show': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'tenants.tenants.index': { paramsTuple?: []; params?: {} }
    'access.my_permissions.show': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profile.avatar.update': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'attachments.attachments.store': { paramsTuple?: []; params?: {} }
    'tenants.tenants.store': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}