import { AttachmentSchema } from '#database/schema'
import type { AttachmentExtname } from '#attachments/rules'

export default class Attachment extends AttachmentSchema {
  declare extname: AttachmentExtname

  get key() {
    return `attachments/${this.id}`
  }
}
