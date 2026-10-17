import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@monorepo/ui/components/card'
import { CreateWorkspaceForm } from '@/features/tenancy/components/create-workspace-form'

export function OnboardingPage() {
  return (
    <main className="flex flex-1 items-start justify-center p-4 md:items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>Create your workspace</h1>
          </CardTitle>
          <CardDescription>
            A workspace holds your team: its members, their roles and invitations. Invited to an
            existing one? Open the link in your invitation email instead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateWorkspaceForm />
        </CardContent>
      </Card>
    </main>
  )
}
