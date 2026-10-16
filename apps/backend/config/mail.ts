import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  /**
   * Default mailer used by `mail.send()`.
   */
  default: env.get('MAIL_MAILER'),

  from: {
    address: env.get('MAIL_FROM_ADDRESS'),
    name: env.get('MAIL_FROM_NAME'),
  },

  mailers: {
    /**
     * Points at mailpit (compose.yaml) in development.
     */
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
