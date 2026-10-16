import { AttachmentSchema } from '#database/schema'

export default class Attachment extends AttachmentSchema {
  static override selfAssignPrimaryKey = true

  get key() {
    return `attachments/${this.id}`
  }
}
