import { AttachmentSchema } from '#database/schema'
import type { AttachmentExtname } from '#attachments/rules'

export default class Attachment extends AttachmentSchema {
  static override selfAssignPrimaryKey = true

  declare extname: AttachmentExtname

  get key() {
    return `attachments/${this.id}`
  }
}
