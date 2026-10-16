import { Exception } from '@adonisjs/core/exceptions'

export default class MemberNotFoundException extends Exception {
  static override status = 404
  static override code = 'E_MEMBER_NOT_FOUND'
  static override message = 'This user is not a member'
}
