export interface TwoFactorReset {
  email: string
  /** The admin's request locale, or the default from `node ace`: the user's isn't stored. */
  locale: string
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'admin:two_factor_reset': TwoFactorReset
  }
}
