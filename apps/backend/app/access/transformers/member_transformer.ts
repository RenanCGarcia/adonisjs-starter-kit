import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#users/transformers/user_transformer'
import type { MemberRow } from '#access/queries/list_members'

export default class MemberTransformer extends BaseTransformer<MemberRow> {
  toObject() {
    return {
      user: UserTransformer.transform(this.resource.user),
      roleId: this.resource.roleId,
      permissions: this.resource.permissions,
    }
  }
}
