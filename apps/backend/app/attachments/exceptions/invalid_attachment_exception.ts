import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidAttachmentException extends Exception {
  static override status = 422
  static override code = 'E_INVALID_ATTACHMENT'
  static override message = 'One or more attachments are missing or not accepted here'
}
