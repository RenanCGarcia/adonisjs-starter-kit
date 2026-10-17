import type { TuyauError } from '@tuyau/core/client'

/** Codes the API returns for expected failures: exceptions send `code`, the tenant middleware sends `key`. */
const API_ERROR_MESSAGES = {
  E_ROLE_IN_USE: 'Move this role’s members to another role before deleting it.',
  E_LAST_MANAGER:
    'Someone must still be able to manage members. Give that permission to another member first.',
  E_ALREADY_MEMBER: 'This person is already a member of the workspace.',
  E_INVITATION_NOT_FOUND: 'This invitation doesn’t exist or has expired.',
  E_INVITATION_EMAIL_MISMATCH: 'This invitation was sent to a different email address.',
  E_MEMBER_NOT_FOUND: 'This person is no longer a member of the workspace.',
  E_TENANT_ACCESS_DENIED: 'You’re not a member of this workspace.',
  E_INVALID_TENANT_HEADER: 'This workspace link is not valid.',
  E_INVALID_ATTACHMENT: 'This file can’t be used here.',
} as const

export type ApiErrorCode = keyof typeof API_ERROR_MESSAGES

/** Every error body the backend sends, merged: exceptions, the tenant middleware, and validation. */
type ApiErrorBody = {
  message?: string
  code?: string
  key?: string
  errors?: ValidationError[]
}

type ValidationError = {
  field?: string
  message: string
  rule?: string
  meta?: { min?: number; max?: number }
}

/** VineJS's default messages name the raw field (`passwordConfirmation`); these read well under any label. */
const RULE_MESSAGES = {
  'required': () => 'This field is required.',
  'email': () => 'Enter a valid email address.',
  'database.unique': () => 'This is already taken.',
  'sameAs': () => 'This doesn’t match.',
  'minLength': (meta: ValidationError['meta']) => `Use at least ${meta?.min} characters.`,
  'maxLength': (meta: ValidationError['meta']) => `Use at most ${meta?.max} characters.`,
} as const

function isKnownRule(rule: string): rule is keyof typeof RULE_MESSAGES {
  return rule in RULE_MESSAGES
}

function validationMessage({ rule, meta, message }: ValidationError) {
  return rule !== undefined && isKnownRule(rule) ? RULE_MESSAGES[rule](meta) : message
}

export type FormErrors = {
  /** First message per field name, from a 422. */
  fields: Map<string, string>
  /** A message for the whole form, when the error isn't about one field. */
  form: string | null
}

export const NO_FORM_ERRORS: FormErrors = { fields: new Map(), form: null }

const NETWORK_MESSAGE = 'Can’t reach the server. Check your connection and try again.'
const FALLBACK_MESSAGE = 'Something went wrong. Try again.'

function errorBody(error: TuyauError): ApiErrorBody {
  // SAFETY: every non-2xx body this API sends is one of the shapes ApiErrorBody merges.
  return (error.response ?? {}) as ApiErrorBody
}

function isKnownCode(code: string): code is ApiErrorCode {
  return code in API_ERROR_MESSAGES
}

export function apiErrorCode(error: TuyauError): ApiErrorCode | null {
  const { code, key } = errorBody(error)
  const value = code ?? key

  return value !== undefined && isKnownCode(value) ? value : null
}

export function errorMessage(error: TuyauError): string {
  if (error.kind === 'network') return NETWORK_MESSAGE

  const code = apiErrorCode(error)

  if (code) return API_ERROR_MESSAGES[code]

  const body = errorBody(error)

  return body.errors?.[0]?.message ?? body.message ?? FALLBACK_MESSAGE
}

export function formErrors(error: TuyauError): FormErrors {
  const fields = new Map<string, string>()

  if (error.status === 422) {
    for (const validationError of errorBody(error).errors ?? []) {
      const { field } = validationError

      if (field !== undefined && !fields.has(field))
        fields.set(field, validationMessage(validationError))
    }
  }

  return { fields, form: fields.size > 0 ? null : errorMessage(error) }
}
