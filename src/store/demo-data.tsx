import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { generateSeed } from '@/data/seed'
import { DATASET_VERSION, type DemoDataset } from '@/data/types'
import { checkDatasetInvariants } from '@/lib/invariants'
import { DemoDataContext } from './demo-data-context'

const STORAGE_KEY = 'moniva.demo.v1'

interface InitialState {
  data: DemoDataset
  /** Why saved data was discarded on load, if it was. */
  reset?: 'unreadable' | 'outdated'
}

const RESET_MESSAGES = {
  unreadable: 'Saved demo data could not be read, so the demo dataset was restored.',
  outdated: "Moniva's demo data was updated, so your saved demo changes were reset.",
}

function loadInitialState(): InitialState {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === null) return { data: generateSeed() }
  try {
    const parsed = JSON.parse(saved) as Partial<DemoDataset>
    if (parsed.version === DATASET_VERSION) return { data: parsed as DemoDataset }
    if (typeof parsed.version === 'number') return { data: generateSeed(), reset: 'outdated' }
  } catch {
    // Falls through to restoring the seed below.
  }
  return { data: generateSeed(), reset: 'unreadable' }
}

function reportViolations(data: DemoDataset) {
  for (const violation of checkDatasetInvariants(data)) console.error(`[dataset] ${violation}`)
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitialState)
  const [data, setData] = useState(initial.data)
  const startupHandled = useRef(false)

  // Runs once, even under StrictMode's double effects, so the toast is not repeated.
  useEffect(() => {
    if (startupHandled.current) return
    startupHandled.current = true
    if (initial.reset) {
      localStorage.removeItem(STORAGE_KEY)
      if (initial.reset === 'unreadable') toast.error(RESET_MESSAGES.unreadable)
      else toast.info(RESET_MESSAGES.outdated)
    }
    if (import.meta.env.DEV) reportViolations(initial.data)
  }, [initial])

  const update = useCallback((change: (current: DemoDataset) => DemoDataset) => {
    setData((current) => {
      const next = change(current)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      if (import.meta.env.DEV) reportViolations(next)
      return next
    })
  }, [])

  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setData(generateSeed())
  }, [])

  const store = useMemo(() => ({ data, update, resetDemoData }), [data, update, resetDemoData])
  return <DemoDataContext.Provider value={store}>{children}</DemoDataContext.Provider>
}
