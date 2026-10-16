import type { HttpContext } from '@adonisjs/core/http'
import UploadAttachment from '#attachments/actions/upload_attachment'
import { uploadAttachmentValidator } from '#attachments/validators/attachment'
import AttachmentTransformer from '#attachments/transformers/attachment_transformer'

export default class AttachmentsController {
  async store({ request, auth, serialize }: HttpContext) {
    const { file } = await request.validateUsing(uploadAttachmentValidator)

    const attachment = await new UploadAttachment().handle({
      file,
      uploaderId: auth.getUserOrFail().id,
    })

    return serialize(AttachmentTransformer.transform(attachment))
  }
}
