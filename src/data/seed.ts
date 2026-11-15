import { DATASET_VERSION } from './types.ts'
import type {
  BankRecord,
  Channel,
  Conversation,
  Customer,
  DemoDataset,
  Expense,
  ExpenseCategory,
  Message,
  Order,
  OrderItem,
  OrderStatus,
  PaymentChannel,
  Product,
  Transaction,
} from './types.ts'

/** The demo's fixed "today". Never use the system clock for demo data or periods. */
export const DEMO_TODAY = '2026-11-30'

const SEED = 20261130

// Dec 2025 to Nov 2026. Index 10 (Oct) and 11 (Nov) exclude the showcase records added later.
const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2025, 11 + i, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
})
const ENQUIRIES = [70, 68, 75, 79, 82, 80, 86, 90, 94, 98, 105, 113]
const COMPLETED = [24, 23, 26, 28, 29, 28, 31, 32, 32, 35, 37, 39]
const CANCELLED = [3, 3, 3, 4, 3, 4, 3, 4, 3, 4, 3, 3]
const LAST_GENERATED_DAY_NOV = 26
const BASKET_SIZES = [1, 2, 1, 2, 3, 1, 2, 1, 1, 2]

const PRODUCTS: Product[] = [
  { id: 'prd_01', name: 'Brown handbag', category: 'Bags', price: 35000 },
  { id: 'prd_02', name: 'Black handbag', category: 'Bags', price: 32000 },
  { id: 'prd_03', name: 'Leather tote', category: 'Bags', price: 45000 },
  { id: 'prd_04', name: 'Ankara wrap dress', category: 'Dresses', price: 28500 },
  { id: 'prd_05', name: 'Bodycon dress', category: 'Dresses', price: 24000 },
  { id: 'prd_06', name: 'Adire two-piece set', category: 'Sets', price: 38000 },
  { id: 'prd_07', name: 'Aso-oke gele', category: 'Accessories', price: 18000 },
  { id: 'prd_08', name: 'Silk headwrap', category: 'Accessories', price: 9500 },
  { id: 'prd_09', name: 'Beaded clutch', category: 'Bags', price: 22000 },
  { id: 'prd_10', name: 'Lace kaftan', category: 'Dresses', price: 55000 },
  { id: 'prd_11', name: 'Linen palazzo set', category: 'Sets', price: 31000 },
  { id: 'prd_12', name: 'Block heel sandals', category: 'Shoes', price: 26000 },
  { id: 'prd_13', name: 'Statement earrings', category: 'Accessories', price: 7500 },
  { id: 'prd_14', name: 'Kimono jacket', category: 'Outerwear', price: 21000 },
]

const FIRST_NAMES = [
  'Adaeze', 'Adebola', 'Adesuwa', 'Afolake', 'Aisha', 'Bolanle', 'Bukola', 'Chiamaka', 'Chioma',
  'Damilola', 'Ebere', 'Efe', 'Ejiro', 'Eniola', 'Folake', 'Gbemisola', 'Halima', 'Ifeoma', 'Ijeoma',
  'Ireti', 'Jumoke', 'Kemi', 'Kike', 'Lola', 'Mercy', 'Modupe', 'Nkechi', 'Nneka', 'Obiageli',
  'Omolara', 'Onyinye', 'Oluwaseun', 'Precious', 'Remi', 'Ronke', 'Sade', 'Sekinat', 'Simi',
  'Temitope', 'Titilayo', 'Tosin', 'Uche', 'Uju', 'Yetunde', 'Zainab', 'Blessing', 'Chinedu',
  'Emeka', 'Ifeanyi', 'Tunde', 'Segun', 'Femi', 'Ibrahim', 'Obinna', 'Dayo', 'Kunle', 'Joy', 'Esther',
]
const LAST_NAMES = [
  'Adeleke', 'Afolabi', 'Ajayi', 'Akande', 'Akinola', 'Alabi', 'Anyanwu', 'Babatunde', 'Balogun',
  'Chukwu', 'Danjuma', 'Ekwueme', 'Eze', 'Ibe', 'Ige', 'Igwe', 'Mohammed', 'Nnaji', 'Nwachukwu',
  'Nwankwo', 'Obi', 'Odukoya', 'Ogunbiyi', 'Okeke', 'Okonkwo', 'Okoro', 'Olaniyan', 'Olawale',
  'Onuoha', 'Oyelaran', 'Oyewole', 'Salami', 'Sanni', 'Uzor', 'Yusuf',
]

const ENQUIRY_OPENERS = [
  'Good afternoon, is the {p} still available?',
  'Hi, how much is the {p}?',
  'Please do you still have the {p}?',
  'Hello, I saw the {p} on your status. Is it available?',
  'Good morning. Do you have the {p} in stock?',
]
const NO_ORDER_REPLIES = ['Okay, let me think about it.', "Alright, I'll get back to you.", 'Thank you, I will let you know.']

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0')

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

function at(year: number, month: number, day: number, hour: number, minute: number): string {
  return toIso(new Date(year, month - 1, day, hour, minute))
}

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + minutes)
  return toIso(d)
}

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`
const roundTo500 = (n: number) => Math.round(n / 500) * 500

export function generateSeed(): DemoDataset {
  const rand = mulberry32(SEED)
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)]
  const chance = (p: number) => rand() < p

  const customers: Customer[] = []
  const conversations: Conversation[] = []
  const orders: Order[] = []
  const transactions: Transaction[] = []
  const bankRecords: BankRecord[] = []
  const expenses: Expense[] = []

  let txCounter = 0
  let saleCounter = 0
  let receiptCounter = 0
  const usedNames = new Set<string>()
  const generatedCustomers: Customer[] = []
  const buyers: Customer[] = []
  const buyerIds = new Set<string>()

  function addCustomer(name: string, channel: Channel, firstSeen: string): Customer {
    const customer = { id: `cus_${pad(customers.length + 1, 3)}`, name, channel, firstSeen }
    customers.push(customer)
    usedNames.add(name)
    return customer
  }

  function newGeneratedCustomer(firstSeen: string): Customer {
    let name: string
    do name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    while (usedNames.has(name))
    const customer = addCustomer(name, chance(0.7) ? 'whatsapp' : 'instagram', firstSeen)
    generatedCustomers.push(customer)
    return customer
  }

  function nextReference(date: string): string {
    txCounter += 1
    return `TRX-${date.slice(2, 4)}${date.slice(5, 7)}-${pad(txCounter, 4)}`
  }

  function addConversation(
    customer: Customer,
    startedAt: string,
    lines: Array<[Message['sender'], string]>,
    extraction: Conversation['extraction'],
  ): Conversation {
    const conversation: Conversation = {
      id: `cnv_${pad(conversations.length + 1, 4)}`,
      customerId: customer.id,
      channel: customer.channel,
      startedAt,
      messages: lines.map(([sender, text], i) => ({ sender, text, at: addMinutes(startedAt, i * 3) })),
      extraction,
    }
    conversations.push(conversation)
    return conversation
  }

  function addOrder(
    customer: Customer,
    conversation: Conversation | undefined,
    items: OrderItem[],
    date: string,
    status: OrderStatus,
    paymentMethod: Order['paymentMethod'],
  ): Order {
    const order: Order = {
      id: `ord_${pad(orders.length + 1, 4)}`,
      customerId: customer.id,
      conversationId: conversation?.id,
      items,
      amount: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      date,
      channel: customer.channel,
      source: customer.channel,
      verificationLabel:
        status === 'completed' ? (paymentMethod === 'cash' ? 'merchant_confirmed' : 'verified') : 'unverified',
      status,
      paymentMethod,
    }
    orders.push(order)
    if (conversation) conversation.extraction.orderId = order.id
    if (status === 'completed' && !buyerIds.has(customer.id)) {
      buyerIds.add(customer.id)
      if (generatedCustomers.includes(customer)) buyers.push(customer)
    }
    return order
  }

  function addVerifiedPayment(order: Order, date: string, channel: Exclude<PaymentChannel, 'cash'>) {
    const reference = nextReference(date)
    transactions.push({
      reference,
      customerId: order.customerId,
      orderId: order.id,
      amount: order.amount,
      date,
      paymentChannel: channel,
      status: 'verified',
      source: 'bank_record',
      verificationLabel: 'verified',
    })
    bankRecords.push({ reference, amount: order.amount, date })
  }

  function addCashPayment(order: Order, date: string) {
    transactions.push({
      reference: nextReference(date),
      customerId: order.customerId,
      orderId: order.id,
      amount: order.amount,
      date,
      paymentChannel: 'cash',
      status: 'merchant_confirmed',
      source: 'manual_entry',
      verificationLabel: 'merchant_confirmed',
    })
  }

  function addFailedPayment(order: Order, date: string) {
    transactions.push({
      reference: nextReference(date),
      customerId: order.customerId,
      orderId: order.id,
      amount: order.amount,
      date,
      paymentChannel: 'card',
      status: 'failed',
      source: 'bank_record',
      verificationLabel: 'unverified',
    })
  }

  /** A customer-sent receipt. `bankAmount` adds a trusted bank record with the same reference. */
  function addReceipt(
    customerId: string,
    orderId: string | undefined,
    amount: number,
    date: string,
    status: 'pending_verification' | 'unmatched',
    bankAmount?: number,
  ) {
    const reference = nextReference(date)
    receiptCounter += 1
    transactions.push({
      reference,
      customerId,
      orderId,
      amount,
      date,
      paymentChannel: 'bank_transfer',
      status,
      source: 'receipt_upload',
      verificationLabel: 'unverified',
      receipt: { sampleId: `rcpt_${pad(receiptCounter, 3)}`, extracted: { reference, amount, date } },
    })
    if (bankAmount !== undefined) bankRecords.push({ reference, amount: bankAmount, date })
  }

  // Showcase customers are created first and kept out of the generator's customer pools.
  const amaka = addCustomer('Amaka Okafor', 'whatsapp', '2026-11-30T11:30:00')
  const chidinma = addCustomer('Chidinma Obi', 'whatsapp', '2026-11-30T12:10:00')
  const favour = addCustomer('Favour Adebayo', 'whatsapp', '2026-10-24T13:20:00')
  const ngozi = addCustomer('Ngozi Eze', 'whatsapp', '2026-11-30T08:40:00')
  const kelechi = addCustomer('Kelechi Nwosu', 'instagram', '2026-11-29T17:30:00')
  const tobi = addCustomer('Tobi Ogunleye', 'whatsapp', '2026-11-27T15:00:00')
  const funmi = addCustomer('Funmi Bello', 'whatsapp', '2026-11-28T11:30:00')
  const bisi = addCustomer('Bisi Adeyemi', 'instagram', '2026-11-29T18:30:00')

  type Outcome = 'completed' | 'cancelled' | 'confirmed' | 'awaiting' | 'none'

  MONTHS.forEach(({ year, month }, i) => {
    const isCurrent = i === MONTHS.length - 1
    const lastDay = isCurrent ? LAST_GENERATED_DAY_NOV : new Date(year, month, 0).getDate()
    const outcomes: Outcome[] = [
      ...Array<Outcome>(COMPLETED[i]).fill('completed'),
      ...Array<Outcome>(CANCELLED[i]).fill('cancelled'),
      ...(isCurrent ? (['confirmed', 'confirmed', 'confirmed', 'awaiting', 'awaiting'] as Outcome[]) : []),
    ]
    while (outcomes.length < ENQUIRIES[i]) outcomes.push('none')

    const planned = outcomes
      .map((outcome) => {
        const day = outcome === 'confirmed' || outcome === 'awaiting' ? int(20, lastDay) : int(1, lastDay)
        return { outcome, startedAt: at(year, month, day, int(8, 20), int(0, 59)) }
      })
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt))

    for (const { outcome, startedAt } of planned) {
      const buying = outcome !== 'none'
      let customer: Customer
      if (buying && buyers.length > 0 && chance(0.4)) customer = pick(buyers)
      else if (!buying && generatedCustomers.length > 0 && chance(0.15)) customer = pick(generatedCustomers)
      else customer = newGeneratedCustomer(startedAt)

      const returning = buyerIds.has(customer.id)
      // Completed orders cycle through products and basket sizes, so average order value stays
      // steady and monthly revenue follows the order counts instead of random swings.
      const chosen: Product[] = []
      if (outcome === 'completed') {
        const size = BASKET_SIZES[saleCounter % BASKET_SIZES.length]
        for (let k = 0; k < size; k++) chosen.push(PRODUCTS[(saleCounter * 5 + k * 3) % PRODUCTS.length])
        saleCounter += 1
      } else {
        const size = buying && chance(0.4) ? 2 : 1
        while (chosen.length < size) {
          const p = pick(PRODUCTS)
          if (!chosen.includes(p)) chosen.push(p)
        }
      }
      const items = chosen.map((p) => ({ productId: p.id, quantity: 1, unitPrice: p.price }))
      const lead = chosen[0]
      const named = chosen.map((p) => p.name.toLowerCase()).join(' and the ')
      const prices = chosen.map((p) => naira(p.price)).join(' and ')
      const cash = outcome === 'completed' && chance(0.22)

      const lines: Array<[Message['sender'], string]> = [
        [
          'customer',
          returning
            ? `I bought from you before and I loved it. Do you have the ${named}?`
            : pick(ENQUIRY_OPENERS).replace('{p}', named),
        ],
        ['merchant', `Yes, it's available for ${prices}.`],
      ]
      if (buying) {
        lines.push(['customer', cash ? "I'll take it. Can I pay cash on delivery?" : "I'll take it. Please send your account details."])
        lines.push([
          'merchant',
          cash ? 'Yes, you can pay cash when it arrives. Thank you!' : 'Thank you! Please share your receipt after payment.',
        ])
      } else if (chance(0.7)) {
        lines.push(['customer', pick(NO_ORDER_REPLIES)])
      }

      const conversation = addConversation(customer, startedAt, lines, {
        productId: lead.id,
        price: lead.price,
        activityType: returning ? 'repeat_purchase_enquiry' : buying ? 'order' : 'product_enquiry',
        purchaseIntent: buying ? 'yes' : chance(0.6) ? 'undetermined' : 'no',
        customerClassification: returning ? 'returning' : 'new',
      })

      if (!buying) continue
      const orderDate = addMinutes(startedAt, 6)
      const status: OrderStatus = outcome === 'awaiting' ? 'awaiting_verification' : outcome
      const order = addOrder(customer, conversation, items, orderDate, status, cash ? 'cash' : 'digital')

      if (outcome === 'completed') {
        const paidAt = addMinutes(orderDate, int(15, 90))
        if (cash) addCashPayment(order, paidAt)
        else {
          if (chance(0.05)) addFailedPayment(order, addMinutes(orderDate, 5))
          const roll = rand()
          addVerifiedPayment(order, paidAt, roll < 0.7 ? 'bank_transfer' : roll < 0.9 ? 'pos' : 'card')
        }
      } else if (outcome === 'awaiting') {
        const sentAt = addMinutes(orderDate, int(20, 120))
        addReceipt(customer.id, order.id, order.amount, sentAt, 'pending_verification', order.amount)
      }
    }

    if (!isCurrent) {
      const sender = pick(buyers)
      const amount = pick(PRODUCTS).price
      addReceipt(sender.id, undefined, amount, at(year, month, int(1, lastDay), int(9, 20), int(0, 59)), 'unmatched')
    }
  })

  // Hand-written showcase records. Messages and values match the project plan exactly.
  const favourChat = addConversation(
    favour,
    '2026-10-24T13:20:00',
    [
      ['customer', 'Good afternoon, do you have the black handbag?'],
      ['merchant', "Yes, it's available for ₦32,000."],
      ['customer', "I'll take it. Please send your account details."],
      ['merchant', 'Thank you! Please share your receipt after payment.'],
    ],
    { productId: 'prd_02', price: 32000, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'new' },
  )
  const favourOrder = addOrder(favour, favourChat, [{ productId: 'prd_02', quantity: 1, unitPrice: 32000 }], '2026-10-24T13:26:00', 'completed', 'digital')
  addVerifiedPayment(favourOrder, '2026-10-24T14:05:00', 'bank_transfer')

  const tobiChat = addConversation(
    tobi,
    '2026-11-27T15:00:00',
    [
      ['customer', 'Hi, how much is the leather tote?'],
      ['merchant', "Yes, it's available for ₦45,000."],
      ['customer', "I'll take it. Please send your account details."],
      ['merchant', 'Thank you! Please share your receipt after payment.'],
    ],
    { productId: 'prd_03', price: 45000, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'new' },
  )
  const tobiOrder = addOrder(tobi, tobiChat, [{ productId: 'prd_03', quantity: 1, unitPrice: 45000 }], '2026-11-27T15:10:00', 'awaiting_verification', 'digital')
  addReceipt(tobi.id, tobiOrder.id, 40000, '2026-11-27T16:00:00', 'pending_verification', 40000)

  const funmiChat = addConversation(
    funmi,
    '2026-11-28T11:30:00',
    [
      ['customer', 'Hi, do you have the silk headwrap in wine colour?'],
      ['merchant', "Yes, it's available for ₦9,500."],
      ['customer', "Great, I'll take one. Sending payment now."],
    ],
    { productId: 'prd_08', price: 9500, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'new' },
  )
  const funmiOrder = addOrder(funmi, funmiChat, [{ productId: 'prd_08', quantity: 1, unitPrice: 9500 }], '2026-11-28T11:45:00', 'completed', 'digital')
  addFailedPayment(funmiOrder, '2026-11-28T12:00:00')
  addVerifiedPayment(funmiOrder, '2026-11-28T12:20:00', 'bank_transfer')

  const kelechiChat = addConversation(
    kelechi,
    '2026-11-29T17:30:00',
    [
      ['customer', 'Hello, is the leather tote still available? I also want the statement earrings.'],
      ['merchant', "Yes, both are available. ₦45,000 for the tote and ₦7,500 for the earrings."],
      ['customer', "I'll take both. I'll pay with POS on delivery."],
    ],
    { productId: 'prd_03', price: 45000, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'new' },
  )
  const kelechiOrder = addOrder(
    kelechi,
    kelechiChat,
    [
      { productId: 'prd_03', quantity: 1, unitPrice: 45000 },
      { productId: 'prd_13', quantity: 1, unitPrice: 7500 },
    ],
    '2026-11-29T17:40:00',
    'completed',
    'digital',
  )
  addVerifiedPayment(kelechiOrder, '2026-11-29T19:00:00', 'pos')

  addReceipt(bisi.id, undefined, 22000, '2026-11-29T18:30:00', 'unmatched')

  const ngoziChat = addConversation(
    ngozi,
    '2026-11-30T08:40:00',
    [
      ['customer', 'Good morning. Do you have the Ankara wrap dress in stock?'],
      ['merchant', "Yes, it's available for ₦28,500."],
      ['customer', "I'll take it. Please send your account details."],
      ['merchant', 'Thank you! Please share your receipt after payment.'],
    ],
    { productId: 'prd_04', price: 28500, activityType: 'order', purchaseIntent: 'yes', customerClassification: 'new' },
  )
  const ngoziOrder = addOrder(ngozi, ngoziChat, [{ productId: 'prd_04', quantity: 1, unitPrice: 28500 }], '2026-11-30T08:50:00', 'awaiting_verification', 'digital')
  addReceipt(ngozi.id, ngoziOrder.id, 28500, '2026-11-30T10:12:00', 'pending_verification', 28500)

  addConversation(
    favour,
    '2026-11-30T09:15:00',
    [['customer', 'I bought the black handbag last month. Do you have another one?']],
    {
      productId: 'prd_02',
      activityType: 'repeat_purchase_enquiry',
      purchaseIntent: 'undetermined',
      customerClassification: 'returning',
    },
  )

  const amakaChat = addConversation(
    amaka,
    '2026-11-30T11:30:00',
    [
      ['customer', 'Hello, please do you have the brown handbag available? How much is it?'],
      ['merchant', "Yes, it's available for ₦35,000."],
      ['customer', 'Okay, I want one. How do I pay?'],
    ],
    { productId: 'prd_01', price: 35000, activityType: 'product_enquiry', purchaseIntent: 'yes', customerClassification: 'new' },
  )
  addOrder(amaka, amakaChat, [{ productId: 'prd_01', quantity: 1, unitPrice: 35000 }], '2026-11-30T11:36:00', 'confirmed', 'digital')

  addConversation(chidinma, '2026-11-30T12:10:00', [['customer', 'Do you have this dress in size 12?']], {
    productName: 'Dress',
    activityType: 'product_enquiry',
    purchaseIntent: 'undetermined',
    customerClassification: 'new',
  })

  // Trusted bank record for sample receipt 1 (Amaka's payment), recorded through the receipt intake.
  bankRecords.push({ reference: 'TRX-2611-0601', amount: 35000, date: '2026-11-30T12:20:00' })

  // Expenses scale with each month's revenue, so both rise together.
  MONTHS.forEach(({ year, month }, i) => {
    const key = `${year}-${pad(month)}`
    const revenue = orders
      .filter((o) => o.status === 'completed' && o.date.startsWith(key))
      .reduce((sum, o) => sum + o.amount, 0)
    const entries: Array<[ExpenseCategory, number, number]> = [
      ['rent', 120000, 1],
      ['data_airtime', 15000 + i * 500, 3],
      ['stock', revenue * 0.42 * 0.6, 5],
      ['packaging', revenue * 0.025, 10],
      ['stock', revenue * 0.42 * 0.4, 18],
      ['logistics', revenue * 0.06, 27],
      ['staff', 180000, 28],
    ]
    for (const [category, amount, day] of entries) {
      expenses.push({
        id: `exp_${pad(expenses.length + 1, 3)}`,
        category,
        amount: roundTo500(amount),
        date: at(year, month, day, 10, 0),
        source: 'manual_entry',
        verificationLabel: 'merchant_confirmed',
      })
    }
  })

  return {
    version: DATASET_VERSION,
    business: {
      name: 'Tolu Fashion House',
      category: 'Fashion and Retail',
      location: 'Lagos, Nigeria',
      primaryChannel: 'whatsapp',
      secondaryChannel: 'instagram',
      operatingSince: '2025-05-30',
    },
    products: PRODUCTS.map((p) => ({ ...p })),
    customers,
    conversations,
    orders,
    transactions,
    bankRecords,
    expenses,
    shares: [],
    reorderReminders: [],
  }
}
