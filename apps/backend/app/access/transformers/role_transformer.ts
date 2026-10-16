import type Role from '#access/models/role'
import { isPermission } from '#access/permissions'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class RoleTransformer extends BaseTransformer<Role> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'createdAt', 'updatedAt']),
      permissions: this.resource.permissions.filter(isPermission),
    }
  }
}
