/** Predefined receipts for the simulated receipt intake. Extraction values are fixed, not read from an image. */
export interface SampleReceipt {
  id: string
  sender: string
  reference: string
  amount: number
  date: string
  /** What the sample demonstrates, shown in the picker. */
  note: string
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'sample_1',
    sender: 'Amaka Okafor',
    reference: 'TRX-2611-0601',
    amount: 35000,
    date: '2026-11-30T12:20:00',
    note: 'Payment for a confirmed order',
  },
  {
    id: 'sample_2',
    sender: 'Chinedu Okeke',
    reference: 'TRX-2611-0602',
    amount: 30000,
    date: '2026-11-30T13:10:00',
    note: 'Transfer from an unknown sender',
  },
  {
    id: 'sample_3',
    sender: 'Kelechi Nwosu',
    reference: 'TRX-2611-0406',
    amount: 52500,
    date: '2026-11-29T19:05:00',
    note: 'A receipt sent a second time',
  },
]

/** Fictional bank shown on every receipt card. Never a real bank's name. */
export const DEMO_BANK = 'Demo Bank'
