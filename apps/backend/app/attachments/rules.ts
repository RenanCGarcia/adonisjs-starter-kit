/**
 * Every type the upload endpoint accepts. No svg, html or js: a signed URL
 * served inline would run their scripts.
 */
export const ATTACHMENT_MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  txt: 'text/plain',
} as const

export type AttachmentExtname = keyof typeof ATTACHMENT_MIME_TYPES

// SAFETY: Object.keys of a const literal returns exactly its keys.
export const ATTACHMENT_EXTNAMES = Object.keys(ATTACHMENT_MIME_TYPES) as AttachmentExtname[]
