import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export type OrderItem = {
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export type OrderStatus = 'placed' | 'confirmed' | 'brewing' | 'ready' | 'delivered' | 'cancelled'

export type Product = {
  id: string
  name: string
  origin: string
  process: string
  notes: string[]
  price: number
  available_today: boolean
  created_at: string
}

export type Order = {
  id: string
  order_number: string
  customer_name: string
  phone: string
  car_number: string
  items: OrderItem[]
  total: number
  payment_status: 'pending' | 'paid' | 'failed'
  status: OrderStatus
  pickup_time: string
  notes: string
  created_at: string
}

export type Settings = {
  id: string
  daily_limit: number
  cups_sold: number
  updated_at: string
}