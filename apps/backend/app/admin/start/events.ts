import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import emitter from '@adonisjs/core/services/emitter'
import TwoFactorResetMail from '#admin/mails/two_factor_reset_mail'

emitter.on('admin:two_factor_reset', ({ email, token, locale }) => {
  const link = `${env.get('FRONTEND_URL')}/reset-password/${token}`

  return mail.sendLater(new TwoFactorResetMail({ email, link, locale }))
})
