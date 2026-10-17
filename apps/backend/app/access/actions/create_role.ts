import Role from '#access/models/role'
import type { Permission } from '#access/permissions'

export interface CreateRoleInput {
  name: string
  permissions: Permission[]
}

export default class CreateRole {
  async handle({ name, permissions }: CreateRoleInput) {
    return Role.create({ name, permissions })
  }
}
