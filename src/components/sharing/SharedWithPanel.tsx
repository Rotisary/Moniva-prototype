import { Link } from 'react-router-dom'
import { Panel } from '@/components/moniva/Panel'
import { Tag } from '@/components/moniva/Tag'
import type { Share } from '@/data/types'
import { formatDateTime } from '@/lib/format'
import { institutionById, SHARE_SECTIONS } from '@/lib/sharing'

export function SharedWithPanel({ shares }: { shares: Share[] }) {
  // Newest first, so a share just confirmed appears at the top.
  const rows = [...shares].reverse()

  return (
    <Panel title="Shared with" className="print:hidden">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not shared with any institution yet.</p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((share) => (
            <li
              key={share.id}
              className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-semibold">{institutionById(share.institutionId)?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {share.sharedSections.length} of {SHARE_SECTIONS.length} sections · consent given {formatDateTime(share.consentedAt)}
                </p>
              </div>
              <Tag className="ml-auto">Simulated</Tag>
              <Link
                to={`/institution-view/${share.id}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-tint-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`View what ${institutionById(share.institutionId)?.name} sees`}
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
