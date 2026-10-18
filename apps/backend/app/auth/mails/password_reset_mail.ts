import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'
import i18nManager from '@adonisjs/i18n/services/main'
import { USER_TOKEN_EXPIRY } from '#auth/services/user_tokens'

export interface PasswordResetMailInput {
  email: string
  link: string
  locale: string
}

export default class PasswordResetMail extends BaseMail {
  constructor(private data: PasswordResetMailInput) {
    super()
  }

  prepare() {
    const i18n = i18nManager.locale(this.data.locale)
    const appName = env.get('APP_NAME')
    const subject = i18n.t('auth.password_reset_mail.subject')

    // Queued mails reach the worker as JSON, so the views get finished strings, not a bound t().
    const view = {
      link: this.data.link,
      lang: this.data.locale.split('-')[0],
      appName,
      subject,
      preview: i18n.t('auth.password_reset_mail.preview', { appName }),
      heading: i18n.t('auth.password_reset_mail.heading'),
      intro: i18n.t('auth.password_reset_mail.intro', { appName }),
      action: i18n.t('auth.password_reset_mail.action'),
      openLink: i18n.t('auth.password_reset_mail.open_link'),
      pasteLink: i18n.t('mail.paste_link'),
      expires: i18n.t('auth.password_reset_mail.expires', {
        minutes: USER_TOKEN_EXPIRY.password_reset.minutes,
      }),
      footer: i18n.t('auth.password_reset_mail.footer'),
    }

    this.message
      .to(this.data.email)
      .subject(subject)
      .htmlView('emails/password_reset_html', view)
      .textView('emails/password_reset_text', view)
  }
}
