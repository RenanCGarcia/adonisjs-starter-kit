import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import i18nManager from '@adonisjs/i18n/services/main'
import emitter from '@adonisjs/core/services/emitter'
import SeedTenantOwner from '#access/actions/seed_tenant_owner'

emitter.on('tenancy:tenant_created', event => new SeedTenantOwner().handle(event))

emitter.on('access:member_invited', ({ email, token, locale }) => {
  const link = `${env.get('FRONTEND_URL')}/invitations/${token}`
  const i18n = i18nManager.locale(locale)

  return mail.send(message => {
    message
      .to(email)
      .subject(i18n.t('access.invitation_mail.subject'))
      .text(
        `${i18n.t('access.invitation_mail.intro')} ${i18n.t('access.invitation_mail.open_link')}\n${link}`,
      )
      .html(
        `<p>${i18n.t('access.invitation_mail.intro')}</p><p><a href="${link}">${i18n.t('access.invitation_mail.accept')}</a></p>`,
      )
  })
})
