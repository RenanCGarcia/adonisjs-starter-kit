import { currentTenantId } from '#tenancy/tenant_context'
import type { ChainableContract } from '@adonisjs/lucid/types/querybuilder'

/**
 * Whose roles and grants apply: a tenant id, or null for platform level. This file is all
 * access knows about tenancy; "Access without tenancy" in docs/architecture.md replaces it.
 */
export type Scope = string | null

export function currentScope(): Scope {
  return currentTenantId()
}

export function inScope<Query extends ChainableContract>(
  query: Query,
  scope: Scope,
  table: string,
) {
  return scope === null
    ? query.whereNull(`${table}.tenant_id`)
    : query.where(`${table}.tenant_id`, scope)
}

export function scopeColumns(scope: Scope) {
  return { tenantId: scope }
}
