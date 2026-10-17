export interface MemberInvited {
  tenantId: string
  email: string
  token: string
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'access:member_invited': MemberInvited
  }
}
