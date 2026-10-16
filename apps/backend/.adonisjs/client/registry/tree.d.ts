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
  access: {
    myPermissions: {
      show: typeof routes['access.my_permissions.show']
    }
    roles: {
      index: typeof routes['access.roles.index']
      store: typeof routes['access.roles.store']
      update: typeof routes['access.roles.update']
      destroy: typeof routes['access.roles.destroy']
    }
    memberRoles: {
      update: typeof routes['access.member_roles.update']
    }
    memberPermissions: {
      update: typeof routes['access.member_permissions.update']
    }
  }
  healthChecks: {
    live: typeof routes['health_checks.live']
    ready: typeof routes['health_checks.ready']
  }
}
