import type { Customer, DemoDataset, Order, Transaction } from '@/data/types'
import { formatNaira } from './format'

export type AmountComparison =
  | { kind: 'match' }
  | { kind: 'short'; difference: number }
  | { kind: 'over'; difference: number }

/** Compares what a receipt says against what the order is for. */
export function amountComparison(receiptAmount: number, orderAmount: number): AmountComparison {
  if (receiptAmount === orderAmount) return { kind: 'match' }
  return receiptAmount < orderAmount
    ? { kind: 'short', difference: orderAmount - receiptAmount }
    : { kind: 'over', difference: receiptAmount - orderAmount }
}

/** Order-picker value meaning the receipt is not matched to an order yet. */
export const NO_ORDER = 'none'

/** Orders that can take a new receipt. Only unpaid confirmed orders, so a payment is never linked twice. */
export const selectableOrders = (data: DemoDataset): Order[] =>
  data.orders.filter((o) => o.status === 'confirmed').sort((a, b) => b.date.localeCompare(a.date))

const setOrderStatus = (orders: Order[], id: string | undefined, change: Partial<Order>) =>
  orders.map((o) => (o.id === id ? { ...o, ...change } : o))

const setTransaction = (transactions: Transaction[], reference: string, change: Partial<Transaction>) =>
  transactions.map((t) => (t.reference === reference ? { ...t, ...change } : t))

export interface ReceiptInput {
  sender: string
  reference: string
  amount: number
  date: string
  orderId?: string
  sampleId: string
  fileName?: string
}

export type RecordReceiptResult =
  | { ok: true; data: DemoDataset; reference: string }
  | { ok: false; reason: 'duplicate'; existing: Transaction }
  | { ok: false; reason: 'order-unavailable' }

/** Adds a customer-sent receipt as Pending verification. A receipt never verifies a payment on its own. */
export function recordReceipt(data: DemoDataset, input: ReceiptInput): RecordReceiptResult {
  const reference = input.reference.trim().toUpperCase()
  const existing = data.transactions.find((t) => t.reference === reference)
  if (existing) return { ok: false, reason: 'duplicate', existing }

  const order = input.orderId ? data.orders.find((o) => o.id === input.orderId) : undefined
  if (input.orderId && order?.status !== 'confirmed') return { ok: false, reason: 'order-unavailable' }

  let customers = data.customers
  let customerId = order?.customerId ?? data.customers.find((c) => c.name === input.sender)?.id
  if (!customerId) {
    const count = data.customers.filter((c) => c.id.startsWith('cus_rc_')).length
    const customer: Customer = {
      id: `cus_rc_${String(count + 1).padStart(2, '0')}`,
      name: input.sender,
      channel: 'whatsapp',
      firstSeen: input.date,
    }
    customers = [...customers, customer]
    customerId = customer.id
  }

  const transaction: Transaction = {
    reference,
    customerId,
    orderId: order?.id,
    amount: input.amount,
    date: input.date,
    paymentChannel: 'bank_transfer',
    status: 'pending_verification',
    source: 'receipt_upload',
    verificationLabel: 'unverified',
    receipt: {
      sampleId: input.sampleId,
      fileName: input.fileName,
      extracted: { reference, amount: input.amount, date: input.date },
    },
  }

  return {
    ok: true,
    reference,
    data: {
      ...data,
      customers,
      transactions: [...data.transactions, transaction],
      orders: order ? setOrderStatus(data.orders, order.id, { status: 'awaiting_verification' }) : data.orders,
    },
  }
}

/** Links a pending receipt that has no order to an unpaid confirmed order. */
export function linkOrder(data: DemoDataset, reference: string, orderId: string): DemoDataset {
  const tx = data.transactions.find((t) => t.reference === reference)
  const order = data.orders.find((o) => o.id === orderId)
  if (!tx || tx.status !== 'pending_verification' || tx.orderId || order?.status !== 'confirmed') return data
  return {
    ...data,
    transactions: setTransaction(data.transactions, reference, { orderId }),
    orders: setOrderStatus(data.orders, orderId, { status: 'awaiting_verification' }),
  }
}

export type VerifyOutcome =
  | { kind: 'not-pending' }
  | { kind: 'needs-order' }
  | { kind: 'no-bank-record' }
  | { kind: 'bank-amount-differs'; bankAmount: number; receiptAmount: number }
  | {
      kind: 'order-amount-differs'
      bankAmount: number
      orderAmount: number
      comparison: Exclude<AmountComparison, { kind: 'match' }>
    }
  | { kind: 'verified' }

/**
 * Checks a pending receipt against the seeded trusted bank records.
 * Only a matching bank record, receipt, and order amount verifies the payment and completes the order.
 */
export function verifyAgainstBank(data: DemoDataset, reference: string): { data: DemoDataset; outcome: VerifyOutcome } {
  const tx = data.transactions.find((t) => t.reference === reference)
  if (!tx || tx.status !== 'pending_verification') return { data, outcome: { kind: 'not-pending' } }
  const order = tx.orderId ? data.orders.find((o) => o.id === tx.orderId) : undefined
  if (!order) return { data, outcome: { kind: 'needs-order' } }

  const unmatched = (outcome: VerifyOutcome) => ({
    outcome,
    data: {
      ...data,
      transactions: setTransaction(data.transactions, reference, { status: 'unmatched' }),
      orders:
        order.status === 'awaiting_verification'
          ? setOrderStatus(data.orders, order.id, { status: 'confirmed' })
          : data.orders,
    },
  })

  const bank = data.bankRecords.find((b) => b.reference === reference)
  if (!bank) return unmatched({ kind: 'no-bank-record' })
  if (bank.amount !== tx.amount) {
    return unmatched({ kind: 'bank-amount-differs', bankAmount: bank.amount, receiptAmount: tx.amount })
  }

  const comparison = amountComparison(bank.amount, order.amount)
  if (comparison.kind !== 'match') {
    return {
      data,
      outcome: { kind: 'order-amount-differs', bankAmount: bank.amount, orderAmount: order.amount, comparison },
    }
  }

  return {
    outcome: { kind: 'verified' },
    data: {
      ...data,
      transactions: setTransaction(data.transactions, reference, { status: 'verified', verificationLabel: 'verified' }),
      orders: setOrderStatus(data.orders, order.id, { status: 'completed', verificationLabel: 'verified' }),
    },
  }
}

/** Why an unmatched receipt could not be matched to a trusted bank record. */
export function unmatchedReason(data: DemoDataset, tx: Transaction): string {
  const bank = data.bankRecords.find((b) => b.reference === tx.reference)
  if (!bank) return `No bank record with reference ${tx.reference}.`
  if (bank.amount !== tx.amount) {
    return `Bank record shows ${formatNaira(bank.amount)}, but the receipt says ${formatNaira(tx.amount)}.`
  }
  return 'This receipt is not linked to a matching order.'
}

/** A one-line explanation of a verification outcome, for the panel and toasts. */
export function outcomeMessage(outcome: VerifyOutcome, reference: string): string {
  switch (outcome.kind) {
    case 'verified':
      return `Payment verified: bank record ${reference} matches the receipt and the order. The order is now completed.`
    case 'needs-order':
      return 'Link this receipt to an order before verifying it.'
    case 'no-bank-record':
      return `No bank record with reference ${reference}. The receipt is now Unmatched and the order is unpaid.`
    case 'bank-amount-differs':
      return `Bank record shows ${formatNaira(outcome.bankAmount)}, but the receipt says ${formatNaira(outcome.receiptAmount)}. The receipt is now Unmatched.`
    case 'order-amount-differs':
      return outcome.comparison.kind === 'short'
        ? `Bank record confirms ${formatNaira(outcome.bankAmount)}. The order is ${formatNaira(outcome.orderAmount)}, so ${formatNaira(outcome.comparison.difference)} is still owed.`
        : `Bank record confirms ${formatNaira(outcome.bankAmount)}, which is ${formatNaira(outcome.comparison.difference)} more than the ${formatNaira(outcome.orderAmount)} order. Check the order before verifying.`
    case 'not-pending':
      return 'This transaction is no longer pending verification.'
  }
}
