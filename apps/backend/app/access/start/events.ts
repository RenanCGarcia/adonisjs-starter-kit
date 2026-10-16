import emitter from '@adonisjs/core/services/emitter'
import SeedTenantOwner from '#access/actions/seed_tenant_owner'

emitter.on('tenancy:tenant_created', event => new SeedTenantOwner().handle(event))
