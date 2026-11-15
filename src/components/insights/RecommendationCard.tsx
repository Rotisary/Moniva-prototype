import { ArrowRight, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tag } from '@/components/moniva/Tag'
import type { Recommendation } from '@/lib/insights'

export function RecommendationCard({ recommendation: r }: { recommendation: Recommendation }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-background p-4">
      <div className="flex items-start gap-2">
        <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0" />
        <h3 className="font-semibold">{r.title}</h3>
        <Tag className="ml-auto">Recommendation</Tag>
      </div>
      <p className="text-sm">{r.body}</p>
      {r.link && (
        <Link
          to={r.link.to}
          className="mt-auto inline-flex items-center gap-1 self-start rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-tint-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {r.link.label}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      )}
    </li>
  )
}
