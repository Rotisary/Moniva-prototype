import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function CardFooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="mt-auto block rounded-xl bg-background p-3 text-center font-semibold transition-colors hover:bg-tint-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </Link>
  )
}
