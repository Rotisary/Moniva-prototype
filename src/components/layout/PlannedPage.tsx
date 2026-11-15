import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'

/** Holds a route until its build-plan feature replaces it. Feature 8 removes any that remain. */
export function PlannedPage({ feature, description }: { feature: number; description: string }) {
  return (
    <div className="rounded-2xl bg-card p-6">
      <p className="max-w-prose">{description}</p>
      <SimulatedNotice className="mt-4 max-w-prose">This page is built in feature {feature} of the Moniva build plan.</SimulatedNotice>
    </div>
  )
}
