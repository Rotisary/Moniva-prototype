import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { generateSeed } from '@/data/seed'
import { DATASET_VERSION, type DemoDataset } from '@/data/types'
import { checkDatasetInvariants } from '@/lib/invariants'
import { DemoDataContext } from './demo-data-context'

const STORAGE_KEY = 'moniva.demo.v1'

interface InitialState {
  data: DemoDataset
  restoredFromBadSave: boolean
}

function loadInitialState(): InitialState {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === null) return { data: generateSeed(), restoredFromBadSave: false }
  try {
    const parsed = JSON.parse(saved) as Partial<DemoDataset>
    if (parsed.version === DATASET_VERSION) return { data: parsed as DemoDataset, restoredFromBadSave: false }
  } catch {
    // Falls through to restoring the seed below.
  }
  return { data: generateSeed(), restoredFromBadSave: true }
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitialState)
  const [data, setData] = useState(initial.data)
  const startupHandled = useRef(false)

  // Runs once, even under StrictMode's double effects, so the toast is not repeated.
  useEffect(() => {
    if (startupHandled.current) return
    startupHandled.current = true
    if (initial.restoredFromBadSave) {
      localStorage.removeItem(STORAGE_KEY)
      toast.error('Saved demo data could not be read, so the demo dataset was restored.')
    }
    if (import.meta.env.DEV) {
      const violations = checkDatasetInvariants(initial.data)
      for (const violation of violations) console.error(`[dataset] ${violation}`)
    }
  }, [initial])

  const update = useCallback((change: (current: DemoDataset) => DemoDataset) => {
    setData((current) => {
      const next = change(current)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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
