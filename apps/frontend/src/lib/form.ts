import type { TuyauError } from '@tuyau/core/client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { formErrors, NO_FORM_ERRORS } from '@/lib/errors'
import type { FormErrors } from '@/lib/errors'

/**
 * Wires a form's submit: a pending flag for the button, and the errors to render.
 * `submit` resolves to the failed call's error or a message for the whole form, or to null on success.
 */
export function useFormSubmit(submit: (form: FormData) => Promise<TuyauError | string | null>) {
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<FormErrors>(NO_FORM_ERRORS)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setErrors(NO_FORM_ERRORS)

    try {
      const failure = await submit(new FormData(event.currentTarget))

      if (failure instanceof Error) setErrors(formErrors(failure))
      else if (failure) setErrors({ fields: new Map(), form: failure })
    } finally {
      setPending(false)
    }
  }

  return { pending, errors, onSubmit }
}

/** A text input's value; FormData holds a string for every input that isn't a file. */
export function textValue(form: FormData, name: string) {
  const value = form.get(name)

  return value instanceof File ? '' : (value ?? '')
}
