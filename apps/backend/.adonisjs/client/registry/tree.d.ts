/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    avatar: {
      update: typeof routes['profile.avatar.update']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  attachments: {
    attachments: {
      store: typeof routes['attachments.attachments.store']
    }
  }
  tenants: {
    tenants: {
      index: typeof routes['tenants.tenants.index']
      store: typeof routes['tenants.tenants.store']
    }
  }
  healthChecks: {
    live: typeof routes['health_checks.live']
    ready: typeof routes['health_checks.ready']
  }
}
