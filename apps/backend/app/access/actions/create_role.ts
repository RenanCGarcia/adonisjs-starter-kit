import Role from '#access/models/role'
import type { Permission } from '#access/permissions'
import { scopeColumns, type Scope } from '#access/scope'

export interface CreateRoleInput {
  scope: Scope
  name: string
  permissions: Permission[]
}

export default class CreateRole {
  async handle({ scope, name, permissions }: CreateRoleInput) {
    return Role.create({ ...scopeColumns(scope), name, permissions })
  }
}
