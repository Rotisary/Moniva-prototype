import { DEMO_TODAY } from './seed.ts'
import type { Customer, DemoDataset, Extraction, Message, Order, OrderItem } from './types.ts'

interface IncomingConversation {
  id: string
  startTime: string
  customerName: string
  /** Id used when the customer does not exist yet. */
  newCustomerId: string
  lines: Array<[Message['sender'], string]>
  extraction: Omit<Extraction, 'orderId'>
  order?: { id: string; items: OrderItem[]; paymentMethod: Order['paymentMethod'] }
}

/** The predefined WhatsApp messages delivered, in order, by "Simulate incoming message". */
export const INCOMING_QUEUE: IncomingConversation[] = [
  {
    id: 'cnv_in_01',
    startTime: '13:05',
    customerName: 'Halima Yusuf',
    newCustomerId: 'cus_in_01',
    lines: [
      ['customer', 'Good afternoon, is the Adire two-piece set available in size 14?'],
      ['merchant', "Yes, it's available for ₦38,000."],
      ['customer', "Okay, I'll take it. Please send your account details."],
    ],
    extraction: { productId: 'prd_06', price: 38000, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'new' },
    order: { id: 'ord_in_01', items: [{ productId: 'prd_06', quantity: 1, unitPrice: 38000 }], paymentMethod: 'digital' },
  },
  {
    id: 'cnv_in_02',
    startTime: '13:40',
    customerName: 'Funmi Bello',
    newCustomerId: 'cus_in_02',
    lines: [['customer', 'Hi, I bought the silk headwrap from you this week. Do you have it in emerald green?']],
    extraction: {
      productId: 'prd_08',
      activityType: 'repeat_purchase_enquiry',
      purchaseIntent: 'undetermined',
      customerClassification: 'returning',
    },
  },
  {
    id: 'cnv_in_03',
    startTime: '14:15',
    customerName: 'Segun Afolabi',
    newCustomerId: 'cus_in_03',
    lines: [
      ['customer', 'How much is the lace kaftan? Do you deliver to Ibadan?'],
      ['merchant', "It's ₦55,000, and yes, we deliver to Ibadan."],
      ['customer', "Okay, thank you. I'll let you know."],
    ],
    extraction: {
      productId: 'prd_10',
      price: 55000,
      activityType: 'product_enquiry',
      purchaseIntent: 'undetermined',
      customerClassification: 'new',
    },
  },
  {
    id: 'cnv_in_04',
    startTime: '14:50',
    customerName: 'Ronke Alabi',
    newCustomerId: 'cus_in_04',
    lines: [
      ['customer', 'Please do you have the block heel sandals in size 40?'],
      ['merchant', "Yes, they're ₦26,000."],
      ['customer', 'I want two pairs. Can I pay cash on delivery?'],
      ['merchant', 'Yes, you can pay cash on delivery.'],
    ],
    extraction: { productId: 'prd_12', price: 26000, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'new' },
    order: { id: 'ord_in_04', items: [{ productId: 'prd_12', quantity: 2, unitPrice: 26000 }], paymentMethod: 'cash' },
  },
  {
    id: 'cnv_in_05',
    startTime: '15:30',
    customerName: 'Esther Nnaji',
    newCustomerId: 'cus_in_05',
    lines: [
      ['customer', 'Is the beaded clutch still available?'],
      ['merchant', "Sorry, it's sold out. We restock next week."],
      ['customer', 'Okay, no problem.'],
    ],
    extraction: { productId: 'prd_09', price: 22000, activityType: 'product_enquiry', purchaseIntent: 'no', customerClassification: 'new' },
  },
  {
    id: 'cnv_in_06',
    startTime: '16:10',
    customerName: 'Favour Adebayo',
    newCustomerId: 'cus_in_06',
    lines: [['customer', "Thank you for checking. I'll take another black handbag. Sending payment shortly."]],
    extraction: { productId: 'prd_02', price: 32000, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'returning' },
    order: { id: 'ord_in_06', items: [{ productId: 'prd_02', quantity: 1, unitPrice: 32000 }], paymentMethod: 'digital' },
  },
]

/** The first queued conversation not yet in the dataset. */
export function nextIncoming(data: DemoDataset): IncomingConversation | undefined {
  const delivered = new Set(data.conversations.map((c) => c.id))
  return INCOMING_QUEUE.find((entry) => !delivered.has(entry.id))
}

const pad = (n: number) => String(n).padStart(2, '0')

function minutesAfter(date: string, time: string, minutes: number): string {
  const d = new Date(`${date}T${time}:00`)
  d.setMinutes(d.getMinutes() + minutes)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

/** Adds the next queued conversation (and its customer and order) to the dataset, or returns null when none are left. */
export function deliverNextIncoming(data: DemoDataset): DemoDataset | null {
  const entry = nextIncoming(data)
  if (!entry) return null

  const startedAt = minutesAfter(DEMO_TODAY, entry.startTime, 0)
  const existing = data.customers.find((c) => c.name === entry.customerName)
  const customer: Customer = existing ?? {
    id: entry.newCustomerId,
    name: entry.customerName,
    channel: 'whatsapp',
    firstSeen: startedAt,
  }

  const order: Order | undefined = entry.order && {
    id: entry.order.id,
    customerId: customer.id,
    conversationId: entry.id,
    items: entry.order.items,
    amount: entry.order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    date: minutesAfter(DEMO_TODAY, entry.startTime, 4),
    channel: 'whatsapp',
    source: 'whatsapp',
    verificationLabel: 'unverified',
    status: 'confirmed',
    paymentMethod: entry.order.paymentMethod,
  }

  return {
    ...data,
    customers: existing ? data.customers : [...data.customers, customer],
    conversations: [
      ...data.conversations,
      {
        id: entry.id,
        customerId: customer.id,
        channel: 'whatsapp',
        startedAt,
        messages: entry.lines.map(([sender, text], i) => ({
          sender,
          text,
          at: minutesAfter(DEMO_TODAY, entry.startTime, i * 3),
        })),
        extraction: { ...entry.extraction, orderId: order?.id },
      },
    ],
    orders: order ? [...data.orders, order] : data.orders,
  }
}
