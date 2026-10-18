import mail from '@adonisjs/mail/services/main'
import emitter from '@adonisjs/core/services/emitter'
import TwoFactorResetMail from '#admin/mails/two_factor_reset_mail'

emitter.on('admin:two_factor_reset', ({ email, locale }) =>
  mail.sendLater(new TwoFactorResetMail({ email, locale })),
)
