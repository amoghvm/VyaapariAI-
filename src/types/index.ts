export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  preferred_language: string
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  name: string
  type: BusinessType
  gst_number: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  settings: BusinessSettings
  created_at: string
  updated_at: string
}

export type BusinessType =
  | 'retail'
  | 'wholesale'
  | 'manufacturing'
  | 'services'
  | 'restaurant'
  | 'other'

export interface BusinessSettings {
  currency: string
  timezone: string
  date_format: string
  number_format: string
  low_stock_threshold: number
  default_payment_terms: number
  enable_credit: boolean
  enable_gst: boolean
}

export interface BusinessMembership {
  id: string
  business_id: string
  user_id: string
  role: BusinessRole
  joined_at: string
}

export type BusinessRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer'

export interface Store {
  id: string
  business_id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  settings: StoreSettings
  created_at: string
  updated_at: string
}

export interface StoreSettings {
  default_tax_rate: number
  invoice_prefix: string
  invoice_start_number: number
  enable_barcode: boolean
  enable_weight_scale: boolean
}

export interface StoreMembership {
  id: string
  store_id: string
  user_id: string
  role: StoreRole
  joined_at: string
}

export type StoreRole = 'manager' | 'staff' | 'viewer'

export interface ProductCategory {
  id: string
  business_id: string
  store_id: string | null
  name: string
  description: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  business_id: string
  store_id: string | null
  category_id: string | null
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  unit: ProductUnit
  sale_price: number
  purchase_price: number | null
  tax_rate: number
  reorder_level: number
  reorder_quantity: number
  is_active: boolean
  is_service: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ProductUnit =
  | 'piece'
  | 'packet'
  | 'kg'
  | 'gram'
  | 'litre'
  | 'ml'
  | 'meter'
  | 'box'
  | 'dozen'
  | 'custom'

export interface Customer {
  id: string
  business_id: string
  store_id: string | null
  name: string
  phone: string | null
  email: string | null
  address: string | null
  gst_number: string | null
  credit_limit: number
  payment_terms: number
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  business_id: string
  store_id: string | null
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  gst_number: string | null
  payment_terms: number
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  business_id: string
  store_id: string
  customer_id: string | null
  invoice_number: string
  invoice_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  balance_amount: number
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  notes: string | null
  status: SaleStatus
  created_by: string
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'overdue'
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'credit' | 'other'
export type SaleStatus = 'draft' | 'confirmed' | 'cancelled' | 'returned'

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string | null
  name: string
  description: string | null
  quantity: number
  unit: string
  unit_price: number
  tax_rate: number
  discount_amount: number
  total_amount: number
  created_at: string
}

export interface Payment {
  id: string
  business_id: string
  store_id: string
  customer_id: string | null
  supplier_id: string | null
  sale_id: string | null
  purchase_id: string | null
  amount: number
  method: PaymentMethod
  reference: string | null
  payment_date: string
  notes: string | null
  created_by: string
  created_at: string
}

export interface Expense {
  id: string
  business_id: string
  store_id: string
  category_id: string | null
  amount: number
  description: string
  expense_date: string
  payment_method: PaymentMethod | null
  reference: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  business_id: string
  store_id: string | null
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  business_id: string
  store_id: string
  supplier_id: string
  invoice_number: string
  invoice_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  balance_amount: number
  payment_status: PaymentStatus
  status: PurchaseStatus
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type PurchaseStatus = 'ordered' | 'received' | 'confirmed' | 'cancelled'

export interface PurchaseItem {
  id: string
  purchase_id: string
  product_id: string | null
  supplier_product_name: string | null
  name: string
  description: string | null
  quantity: number
  unit: string
  unit_price: number
  tax_rate: number
  discount_amount: number
  total_amount: number
  received_quantity: number
  created_at: string
}

export interface InventoryMovement {
  id: string
  business_id: string
  store_id: string
  product_id: string
  type: MovementType
  reference_type: ReferenceType
  reference_id: string | null
  quantity: number
  unit_cost: number | null
  notes: string | null
  created_by: string
  created_at: string
}

export type MovementType =
  | 'sale'
  | 'purchase_receipt'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'transfer_in'
  | 'transfer_out'
  | 'return_in'
  | 'return_out'
  | 'opening_stock'

export type ReferenceType = 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'manual'

export interface DocumentImport {
  id: string
  business_id: string
  store_id: string
  type: DocumentType
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  status: DocumentStatus
  extracted_data: Record<string, unknown> | null
  matched_supplier_id: string | null
  matched_purchase_id: string | null
  error_message: string | null
  created_by: string
  created_at: string
  processed_at: string | null
}

export type DocumentType = 'supplier_invoice' | 'purchase_order' | 'delivery_note' | 'statement' | 'other'
export type DocumentStatus = 'uploaded' | 'processing' | 'extracted' | 'reviewed' | 'matched' | 'posted' | 'failed'

export interface ActionItem {
  id: string
  business_id: string
  store_id: string | null
  type: ActionType
  title: string
  description: string
  priority: ActionPriority
  status: ActionStatus
  related_type: string | null
  related_id: string | null
  data: Record<string, unknown>
  assigned_to: string | null
  due_date: string | null
  created_at: string
  acknowledged_at: string | null
  resolved_at: string | null
}

export type ActionType =
  | 'low_stock'
  | 'overdue_payment'
  | 'reorder_recommendation'
  | 'price_change'
  | 'unusual_transaction'
  | 'supplier_performance'
  | 'inventory_discrepancy'
  | 'custom'

export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ActionStatus = 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'

export interface AssistantInteraction {
  id: string
  business_id: string
  store_id: string | null
  user_id: string
  input_text: string
  input_type: 'text' | 'voice'
  intent: string | null
  entities: Record<string, unknown> | null
  draft_operation: Record<string, unknown> | null
  status: InteractionStatus
  response_text: string | null
  executed_operation_id: string | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export type InteractionStatus =
  | 'received'
  | 'processing'
  | 'awaiting_clarification'
  | 'awaiting_confirmation'
  | 'executing'
  | 'completed'
  | 'failed'

export interface UserContext {
  user: Profile | null
  business: Business | null
  store: Store | null
  membership: BusinessMembership | null
  storeMembership: StoreMembership | null
}