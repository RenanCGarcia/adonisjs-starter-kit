import { Alert, AlertDescription } from '@monorepo/ui/components/alert'
import { Button } from '@monorepo/ui/components/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@monorepo/ui/components/field'
import { Input } from '@monorepo/ui/components/input'
import { CircleAlertIcon, Loader2Icon } from 'lucide-react'
import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import type { FormErrors } from '@/lib/errors'

type TextFieldProps = Omit<ComponentProps<typeof Input>, 'id' | 'name'> & {
  name: string
  label: string
  errors: FormErrors
  description?: ReactNode
}

export function TextField({ name, label, errors, description, ...props }: TextFieldProps) {
  const id = useId()
  const error = errors.fields.get(name)

  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} name={name} aria-invalid={error !== undefined} {...props} />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function FormAlert({ errors }: { errors: FormErrors }) {
  if (!errors.form) return null

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertDescription>{errors.form}</AlertDescription>
    </Alert>
  )
}

export function PendingButton({
  pending,
  children,
  ...props
}: ComponentProps<typeof Button> & { pending: boolean }) {
  return (
    <Button disabled={pending} {...props}>
      {pending && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
      {children}
    </Button>
  )
}
