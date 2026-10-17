import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import emitter from '@adonisjs/core/services/emitter'
import SeedTenantOwner from '#access/actions/seed_tenant_owner'

emitter.on('tenancy:tenant_created', event => new SeedTenantOwner().handle(event))

emitter.on('access:member_invited', ({ email, token }) => {
  const link = `${env.get('FRONTEND_URL')}/invitations/${token}`

  return mail.send(message => {
    message
      .to(email)
      .subject("You've been invited")
      .text(`You've been invited to join a tenant. Open this link to accept:\n${link}`)
      .html(
        `<p>You've been invited to join a tenant.</p><p><a href="${link}">Accept the invitation</a></p>`,
      )
  })
})
