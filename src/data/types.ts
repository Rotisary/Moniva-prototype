export const DATASET_VERSION = 1

export type Channel = 'whatsapp' | 'instagram'
export type Source = 'whatsapp' | 'instagram' | 'receipt_upload' | 'bank_record' | 'manual_entry'
export type VerificationLabel = 'verified' | 'merchant_confirmed' | 'unverified' | 'inferred'

export interface Business {
  name: string
  category: string
  location: string
  primaryChannel: Channel
  secondaryChannel: Channel
  operatingSince: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
}

export interface Customer {
  id: string
  name: string
  channel: Channel
  firstSeen: string
}

export interface Message {
  sender: 'customer' | 'merchant'
  text: string
  at: string
}

export type ActivityType = 'product_enquiry' | 'repeat_purchase_enquiry' | 'order'
export type PurchaseIntent = 'yes' | 'no' | 'undetermined'
export type CustomerClassification = 'new' | 'returning'

export interface Extraction {
  productId?: string
  /** Product as mentioned in the chat, when it does not match a catalogue item. */
  productName?: string
  price?: number
  activityType: ActivityType
  purchaseIntent: PurchaseIntent
  orderId?: string
  customerClassification: CustomerClassification
}

export interface Conversation {
  id: string
  customerId: string
  channel: Channel
  startedAt: string
  messages: Message[]
  extraction: Extraction
}

export type OrderStatus = 'confirmed' | 'awaiting_verification' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  customerId: string
  conversationId?: string
  items: OrderItem[]
  amount: number
  date: string
  channel: Channel
  source: Source
  verificationLabel: VerificationLabel
  status: OrderStatus
  paymentMethod: 'digital' | 'cash'
}

export type PaymentChannel = 'bank_transfer' | 'pos' | 'card' | 'cash'
export type TransactionStatus =
  | 'verified'
  | 'pending_verification'
  | 'unmatched'
  | 'failed'
  | 'merchant_confirmed'

export interface Receipt {
  sampleId: string
  extracted: { reference: string; amount: number; date: string }
}

export interface Transaction {
  reference: string
  customerId: string
  orderId?: string
  amount: number
  date: string
  paymentChannel: PaymentChannel
  status: TransactionStatus
  source: Source
  verificationLabel: VerificationLabel
  receipt?: Receipt
}

export interface BankRecord {
  reference: string
  amount: number
  date: string
}

export type ExpenseCategory = 'stock' | 'logistics' | 'rent' | 'data_airtime' | 'packaging' | 'staff'

export interface Expense {
  id: string
  category: ExpenseCategory
  amount: number
  date: string
  source: Source
  verificationLabel: VerificationLabel
}

export interface DemoDataset {
  version: typeof DATASET_VERSION
  business: Business
  products: Product[]
  customers: Customer[]
  conversations: Conversation[]
  orders: Order[]
  transactions: Transaction[]
  bankRecords: BankRecord[]
  expenses: Expense[]
}
