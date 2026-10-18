import User from '#users/models/user'
import { BaseCommand, args } from '@adonisjs/core/ace'
import i18nManager from '@adonisjs/i18n/services/main'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import RevokeSessions from '#auth/actions/revoke_sessions'
import ResetTwoFactor from '#admin/actions/reset_two_factor'
import TwoFactorNotEnabledException from '#auth/exceptions/two_factor_not_enabled_exception'

export default class ResetTwoFactorCommand extends BaseCommand {
  static override commandName = 'admin:reset-two-factor'
  static override description =
    'Turn off the two-factor of the user with this email and sign them out everywhere'

  static override options: CommandOptions = { startApp: true }

  @args.string({ description: 'Email of an existing user, platform admins included' })
  declare email: string

  override async run() {
    const user = await User.findBy('email', this.email.toLowerCase())

    if (!user) {
      this.logger.error(`No user has the email ${this.email}`)
      this.exitCode = 1

      return
    }

    try {
      await new ResetTwoFactor().handle({ id: user.id, locale: i18nManager.defaultLocale })
    } catch (error) {
      if (!(error instanceof TwoFactorNotEnabledException)) throw error

      this.logger.error(`${user.email} doesn’t have two-factor enabled`)
      this.exitCode = 1

      return
    }

    const revoked = await new RevokeSessions().handle({ user })

    this.logger.info(
      `Two-factor is off for ${user.email}: ${revoked} session(s) signed out, user emailed`,
    )
  }
}
