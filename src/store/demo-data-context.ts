import { createContext, useContext } from 'react'
import type { DemoDataset } from '@/data/types'

export interface DemoDataStore {
  data: DemoDataset
  /** Apply a change to the dataset. The result is saved to localStorage. */
  update: (change: (data: DemoDataset) => DemoDataset) => void
  /** Clear saved changes and restore the seeded dataset. */
  resetDemoData: () => void
}

export const DemoDataContext = createContext<DemoDataStore | null>(null)

export function useDemoData(): DemoDataStore {
  const store = useContext(DemoDataContext)
  if (!store) throw new Error('useDemoData must be used inside DemoDataProvider')
  return store
}
