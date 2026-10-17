/*
|--------------------------------------------------------------------------
| Named throttles
|--------------------------------------------------------------------------
|
| One throttle per endpoint family, so adding a limit to a new route is a
| single `.use(someThrottle)` on its route. Numbers live only here.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import type { HttpContext } from '@adonisjs/core/http'

// `limiter.define(name, ...)` already namespaces `usingKey` under `name`, so the key below only
// needs the part that varies.

/** Caps login attempts per IP regardless of outcome, to stop one IP spraying many emails. */
export const loginIpThrottle = limiter.define('login_ip', (ctx: HttpContext) => {
  return limiter.allowRequests(30).every('15 mins').usingKey(ctx.request.ip())
})

export const signupThrottle = limiter.define('signup', (ctx: HttpContext) => {
  return limiter.allowRequests(5).every('1 hour').usingKey(ctx.request.ip())
})

export const invitationsCreateThrottle = limiter.define(
  'invitations_create',
  (ctx: HttpContext) => {
    const userId = ctx.auth.user!.id
    const tenantId = ctx.tenant!.id

    return limiter.allowRequests(20).every('1 hour').usingKey(`${userId}_${tenantId}`)
  },
)

export const invitationAcceptThrottle = limiter.define('invitation_accept', (ctx: HttpContext) => {
  return limiter.allowRequests(10).every('15 mins').usingKey(ctx.auth.user!.id)
})

/**
 * Used directly, not as middleware: `penalize` consumes a request only when the callback
 * throws, so a correct password never counts against the limit. Keyed by email+IP rather than
 * email alone, so a stranger failing on purpose can't lock the owner out of their account.
 */
export function loginFailureLimiter() {
  return limiter.use({ requests: 5, duration: '15 mins', blockDuration: '15 mins' })
}

export function loginFailureKey(email: string, ip: string) {
  return `login_failure_${ip}_${email}`
}
