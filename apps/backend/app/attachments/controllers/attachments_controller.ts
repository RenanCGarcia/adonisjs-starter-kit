import type { HttpContext } from '@adonisjs/core/http'
import UploadAttachment from '#attachments/actions/upload_attachment'
import { uploadAttachmentValidator } from '#attachments/validators/attachment'
import AttachmentTransformer from '#attachments/transformers/attachment_transformer'

/**
 * @tags Attachments
 */
export default class AttachmentsController {
  /**
   * Upload an attachment
   *
   * Send the file as `multipart/form-data` in the `file` field, up to 20 MB, with an
   * accepted file extension. Returns the attachment with a signed URL valid for 1 hour.
   * Pass its id to an endpoint that takes an attachment, such as the avatar. An attachment
   * that nothing uses after a day is deleted.
   *
   * @throws {413} The request body is larger than 20 MB
   */
  async store({ request, auth, serialize }: HttpContext) {
    const { file } = await request.validateUsing(uploadAttachmentValidator)

    const attachment = await new UploadAttachment().handle({
      file,
      uploaderId: auth.getUserOrFail().id,
    })

    return serialize(AttachmentTransformer.transform(attachment))
  }
}
