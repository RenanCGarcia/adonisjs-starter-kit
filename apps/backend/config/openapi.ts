import env from '#start/env'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as bouncerErrors } from '@adonisjs/bouncer'
import { errors as limiterErrors } from '@adonisjs/limiter'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { defineConfig } from '@enzopita/adonisjs-openapi'

const TENANT_HEADER =
  'Every operation here runs inside the tenant named by the `X-Tenant-Id` header.'

export default defineConfig({
  output: 'openapi.json',
  document: {
    info: {
      title: env.get('APP_NAME'),
      version: '1.0.0',
      description: [
        'Authenticate with the access token that `POST /api/v1/auth/login` returns, sent as `Authorization: Bearer <token>`.',
        'Successful responses wrap their payload in `data`. Every error carries a machine-readable `code` and a `message` for display, except `422`, which lists the invalid fields.',
        'Messages follow the `Accept-Language` header: `en-US` or `pt-BR`, falling back to `en-US`.',
      ].join('\n\n'),
    },
    tags: [
      { name: 'Auth', description: 'Sign up, sign in, and recover access to an account.' },
      {
        name: 'Account',
        description: "The signed-in user's profile, avatar, email verification, and activity.",
      },
      { name: 'Sessions', description: "The signed-in user's access tokens, one per device." },
      {
        name: 'Two-factor',
        description:
          'Time-based one-time passwords (TOTP) and recovery codes for the signed-in user.',
      },
      { name: 'Attachments', description: 'File uploads that other records reference by id.' },
      { name: 'Tenants', description: 'The workspaces the signed-in user belongs to.' },
      { name: 'Permissions', description: `What a member may do in a tenant. ${TENANT_HEADER}` },
      { name: 'Roles', description: `Named sets of permissions in a tenant. ${TENANT_HEADER}` },
      { name: 'Members', description: `The users of a tenant. ${TENANT_HEADER}` },
      {
        name: 'Invitations',
        description: `Invitations to join a tenant by email. ${TENANT_HEADER} Accepting an invitation is the exception: the tenant comes from the invitation.`,
      },
      { name: 'Audit', description: `Who changed what in a tenant, and when. ${TENANT_HEADER}` },
      {
        name: 'Admin',
        description:
          'The platform admin area, across every tenant and user. A platform admin must have two-factor authentication confirmed to use it.',
      },
      {
        name: 'Health',
        description: 'Liveness and readiness probes for orchestrators and monitoring.',
      },
    ],
  },
  security: {
    schemes: {
      accessToken: { type: 'http', scheme: 'bearer' },
      tenant: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Tenant-Id',
        description: 'The id of a tenant the signed-in user is a member of.',
      },
    },
    middleware: {
      auth: 'accessToken',
      tenant: 'tenant',
    },
  },
  errors: {
    throwers: {
      'bouncer.authorize': bouncerErrors.E_AUTHORIZATION_FAILURE,
      'findOrFail': lucidErrors.E_ROW_NOT_FOUND,
      'firstOrFail': lucidErrors.E_ROW_NOT_FOUND,
      'failures.consume': limiterErrors.E_TOO_MANY_REQUESTS,
      'User.verifyCredentials': authErrors.E_INVALID_CREDENTIALS,
    },
    // `limiter.define(name, ...)` names its middleware `${name}Throttle`.
    middleware: {
      login_ipThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      two_factor_login_ipThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      two_factor_manageThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      signupThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      invitations_createThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      invitation_acceptThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      password_forgot_ipThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      password_forgot_emailThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      password_resetThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      email_verifyThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
      email_verification_resendThrottle: limiterErrors.E_TOO_MANY_REQUESTS,
    },
  },
  strict: true,
  rules: { summaryMaxLength: 60, summaryTrailingPeriod: false },
})
