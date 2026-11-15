import { Progress } from '@base-ui/react/progress'
import { Panel } from '@/components/moniva/Panel'
import { Tag } from '@/components/moniva/Tag'
import { HEALTH_DISCLAIMER, type HealthIndicator } from '@/lib/profile'

export function HealthOverview({ indicators }: { indicators: HealthIndicator[] }) {
  return (
    <Panel title="Financial Health Overview">
      <p className="-mt-3 text-sm text-muted-foreground">Credit Readiness Indicators</p>
      <p className="rounded-xl bg-tint-1 px-3.5 py-2.5 text-sm">{HEALTH_DISCLAIMER}</p>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {indicators.map((indicator) => (
          <li key={indicator.id} className="flex break-inside-avoid flex-col gap-3 rounded-xl bg-background p-4">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold">{indicator.name}</h3>
              <Tag emphasis={indicator.label === 'Strong'} className="ml-auto">
                {indicator.label}
              </Tag>
            </div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {indicator.score}
              <span className="text-base font-medium text-muted-foreground"> / 100</span>
            </p>
            <Progress.Root value={indicator.score}>
              <Progress.Label className="sr-only">
                {indicator.name}: {indicator.score} out of 100, {indicator.label}
              </Progress.Label>
              <Progress.Track className="h-2 overflow-hidden rounded-full bg-tint-2">
                <Progress.Indicator className="h-full rounded-full bg-primary" />
              </Progress.Track>
            </Progress.Root>
            <p className="text-sm">{indicator.explanation}</p>
            <p className="mt-auto text-xs text-muted-foreground">How this is calculated: {indicator.formula}</p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
