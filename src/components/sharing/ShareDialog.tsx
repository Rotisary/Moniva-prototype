import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { Tag } from '@/components/moniva/Tag'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Share } from '@/data/types'
import { formatDateTime, formatNairaCompact, formatPercent } from '@/lib/format'
import type { ProfileSummary } from '@/lib/profile'
import {
  addShare,
  INSTITUTION_IDS,
  INSTITUTIONS,
  institutionById,
  SHARE_SECTION_IDS,
  SHARE_SECTIONS,
  SHARING_DISCLAIMER,
} from '@/lib/sharing'
import { cn } from '@/lib/utils'
import { useDemoData } from '@/store/demo-data-context'

const shareSchema = z.object({
  institutionId: z.enum(INSTITUTION_IDS, { message: 'Choose an institution.' }),
  sections: z.array(z.enum(SHARE_SECTION_IDS)),
  consent: z.boolean().refine((v) => v, 'Tick the consent box to share.'),
})

type ShareValues = z.infer<typeof shareSchema>

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: ProfileSummary
}

export function ShareDialog({ open, onOpenChange, summary }: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto p-6 sm:max-w-2xl">
        {/* Mounting only while open gives every share a fresh form. */}
        {open && <ShareFlow summary={summary} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ShareFlow({ summary, onDone }: { summary: ProfileSummary; onDone: () => void }) {
  const { data, update } = useDemoData()
  const [shared, setShared] = useState<Share>()

  const form = useForm<ShareValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: { institutionId: undefined, sections: [...SHARE_SECTION_IDS], consent: false },
  })
  const institutionId = useWatch({ control: form.control, name: 'institutionId' })
  const consent = useWatch({ control: form.control, name: 'consent' })
  const errors = form.formState.errors
  const institution = institutionId ? institutionById(institutionId) : undefined

  const confirm = form.handleSubmit((values) => {
    const input = { institutionId: values.institutionId, sections: values.sections }
    const now = new Date()
    // Computed here only to show the new share; the store appends to its own current data.
    const next = addShare(data, input, now)
    update((current) => addShare(current, input, now))
    setShared(next.shares[next.shares.length - 1])
  })

  if (shared) return <ShareSuccess share={shared} onDone={onDone} />

  const figures: Array<[string, string]> = [
    ['Recorded revenue', formatNairaCompact(summary.revenue)],
    ['Verified digital', formatNairaCompact(summary.verified)],
    ['Operating profit', formatNairaCompact(summary.profit)],
    ['Bank-matched', formatPercent(summary.completeness, 0)],
  ]

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">Share with a financial institution</DialogTitle>
        <DialogDescription>
          Choose what to share and who receives it. Nothing is shared until you give consent and confirm.
        </DialogDescription>
      </DialogHeader>

      <section aria-label="Profile summary" className="rounded-xl bg-background p-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {data.business.name} · last 12 months
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {figures.map(([term, value]) => (
            <div key={term}>
              <dt className="text-xs text-muted-foreground">{term}</dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <form onSubmit={(e) => void confirm(e)} noValidate className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">Data to share</legend>
          <Controller
            control={form.control}
            name="sections"
            render={({ field }) =>
              <ul className="grid gap-2 sm:grid-cols-2">
                {SHARE_SECTIONS.map((section) => {
                  const locked = section.id === 'business_info'
                  const checked = locked || field.value.includes(section.id)
                  const id = `share-section-${section.id}`
                  return (
                    <li key={section.id} className="flex items-start gap-2.5 rounded-xl border border-border p-3">
                      <Checkbox
                        id={id}
                        className="mt-0.5"
                        checked={checked}
                        disabled={locked}
                        aria-describedby={`${id}-desc`}
                        onCheckedChange={(next) =>
                          field.onChange(
                            next ? [...field.value, section.id] : field.value.filter((s) => s !== section.id),
                          )
                        }
                      />
                      <div>
                        <Label htmlFor={id} className="text-sm font-medium">
                          {section.label}
                          {locked && <span className="font-normal text-muted-foreground"> (always shared)</span>}
                        </Label>
                        <p id={`${id}-desc`} className="text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            }
          />
        </fieldset>

        <fieldset
          className="flex flex-col gap-2"
          aria-describedby={errors.institutionId ? 'share-institution-error' : undefined}
        >
          <legend className="mb-2 text-sm font-semibold">Financial institution</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {INSTITUTIONS.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border p-3 has-[:checked]:border-foreground has-[:checked]:bg-tint-1 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
              >
                <span className="flex items-start gap-2">
                  <input
                    type="radio"
                    value={option.id}
                    className="mt-1 accent-primary"
                    {...form.register('institutionId')}
                  />
                  <span className="text-sm font-semibold">{option.name}</span>
                </span>
                <span className="flex flex-wrap gap-1">
                  <Tag>Fictional</Tag>
                  <Tag>{option.type}</Tag>
                </span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </label>
            ))}
          </div>
          {errors.institutionId && (
            <p id="share-institution-error" className="text-sm text-destructive">
              {errors.institutionId.message}
            </p>
          )}
        </fieldset>

        <SimulatedNotice>{SHARING_DISCLAIMER}</SimulatedNotice>

        <div className="flex flex-col gap-1">
          <Controller
            control={form.control}
            name="consent"
            render={({ field }) => (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="share-consent"
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={(next) => field.onChange(next)}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? 'share-consent-error' : undefined}
                />
                <Label htmlFor="share-consent" className="text-sm leading-snug font-normal">
                  I consent to Moniva sharing the selected data with {institution?.name ?? 'the selected institution'} for
                  this simulated review.
                </Label>
              </div>
            )}
          />
          {errors.consent && (
            <p id="share-consent-error" className="text-sm text-destructive">
              {errors.consent.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" className="h-9 rounded-full px-4" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" className="h-9 rounded-full px-4" disabled={!institutionId || !consent}>
            Confirm and share
          </Button>
        </div>
      </form>
    </>
  )
}

function ShareSuccess({ share, onDone }: { share: Share; onDone: () => void }) {
  const institution = institutionById(share.institutionId)
  const labels = SHARE_SECTIONS.filter((s) => share.sharedSections.includes(s.id)).map((s) => s.label)

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <CircleCheck aria-hidden className="size-8" />
        <DialogTitle className="text-lg font-semibold">Shared with {institution?.name}</DialogTitle>
        <DialogDescription>Consent given {formatDateTime(share.consentedAt)}. This share is simulated.</DialogDescription>
      </DialogHeader>
      <div role="status" className="rounded-xl bg-background p-4">
        <p className="text-sm font-semibold">Shared data</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {labels.map((label) => (
            <li key={label}>
              <Tag>{label}</Tag>
            </li>
          ))}
        </ul>
      </div>
      <SimulatedNotice>{SHARING_DISCLAIMER}</SimulatedNotice>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" className="h-9 rounded-full px-4" onClick={onDone}>
          Done
        </Button>
        <Link to={`/institution-view/${share.id}`} className={cn(buttonVariants(), 'h-9 rounded-full px-4')}>
          View institution profile
        </Link>
      </div>
    </div>
  )
}
