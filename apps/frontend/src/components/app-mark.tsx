import { Link } from '@tanstack/react-router'
import { BoxIcon } from 'lucide-react'

export function AppMark() {
  return (
    <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <BoxIcon className="size-3.5" />
      </span>
      Starter
    </Link>
  )
}
