export interface TenantCreated {
  tenantId: string
  creatorId: string
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'tenancy:tenant_created': TenantCreated
  }
}
