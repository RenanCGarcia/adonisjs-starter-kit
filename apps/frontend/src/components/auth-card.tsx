import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@monorepo/ui/components/card'
import type { ReactNode } from 'react'
import { AppMark } from '@/components/app-mark'

/** The centered card that public pages (sign in, sign up, invitations) sit in. */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-4">
      <AppMark />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>{title}</h1>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter className="justify-center">{footer}</CardFooter>}
      </Card>
    </main>
  )
}
