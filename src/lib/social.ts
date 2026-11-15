import type {
  ActivityType,
  Channel,
  Conversation,
  CustomerClassification,
  DemoDataset,
  Extraction,
  Order,
  OrderStatus,
  PurchaseIntent,
} from '@/data/types'
import { formatNaira } from './format'
import type { MonthKey } from './metrics'

export type ChannelFilter = 'all' | Channel

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  product_enquiry: 'Product enquiry',
  repeat_purchase_enquiry: 'Repeat-purchase enquiry',
  order: 'Order request',
}

export const INTENT_LABELS: Record<PurchaseIntent, string> = {
  yes: 'Yes',
  no: 'No',
  undetermined: 'Undetermined',
}

export const CLASSIFICATION_LABELS: Record<CustomerClassification, string> = {
  new: 'New customer',
  returning: 'Returning customer',
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Confirmed',
  awaiting_verification: 'Awaiting verification',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const orderStatusLabel = (order: Order | undefined) =>
  order ? ORDER_STATUS_LABELS[order.status] : 'No confirmed order'

export const productLabel = (data: DemoDataset, x: Extraction) =>
  data.products.find((p) => p.id === x.productId)?.name ?? x.productName ?? 'Not identified'

export const priceLabel = (x: Extraction) => (x.price !== undefined ? formatNaira(x.price) : 'Not stated')

export const linkedOrder = (data: DemoDataset, c: Conversation): Order | undefined =>
  c.extraction.orderId ? data.orders.find((o) => o.id === c.extraction.orderId) : undefined

/** Conversations started in `month` on the selected channel, newest first. */
export function monthConversations(data: DemoDataset, month: MonthKey, channel: ChannelFilter = 'all'): Conversation[] {
  return data.conversations
    .filter((c) => c.startedAt.startsWith(month) && (channel === 'all' || c.channel === channel))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export interface SocialMetrics {
  enquiries: number
  purchaseIntent: number
  confirmedOrders: number
  completedSales: number
  unconverted: number
}

export function socialMetrics(data: DemoDataset, month: MonthKey, channel: ChannelFilter = 'all'): SocialMetrics {
  const statuses = new Map(data.orders.map((o) => [o.id, o.status]))
  const conversations = monthConversations(data, month, channel)
  const statusOf = (c: Conversation) => (c.extraction.orderId ? statuses.get(c.extraction.orderId) : undefined)
  const confirmedOrders = conversations.filter((c) => {
    const status = statusOf(c)
    return status !== undefined && status !== 'cancelled'
  }).length
  return {
    enquiries: conversations.length,
    purchaseIntent: conversations.filter((c) => c.extraction.purchaseIntent === 'yes').length,
    confirmedOrders,
    completedSales: conversations.filter((c) => statusOf(c) === 'completed').length,
    unconverted: conversations.length - confirmedOrders,
  }
}
