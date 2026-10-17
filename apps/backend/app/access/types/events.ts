export interface MemberInvited {
  tenantId: string
  email: string
  token: string
  /** The inviter's locale: the invitee's isn't known until they open the link. */
  locale: string
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'access:member_invited': MemberInvited
  }
}
