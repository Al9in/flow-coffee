'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase, Order, OrderStatus } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'placed', label: 'Placed', desc: 'Order received' },
  { key: 'confirmed', label: 'Confirmed', desc: 'We have your order' },
  { key: 'brewing', label: 'Brewing', desc: 'Your coffee is being crafted' },
  { key: 'ready', label: 'Ready', desc: 'Come pick up your order' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your FLOW' },
]

const STATUS_ORDER: OrderStatus[] = ['placed', 'confirmed', 'brewing', 'ready', 'delivered']

const demoOrder: Order = {
  id: 'demo',
  order_number: 'FLOW-1042',
  customer_name: 'Ahmad',
  phone: '+971 50 000 0000',
  car_number: 'A 12345',
  items: [
    { product_id: 'demo-1', product_name: 'Costa Rica — Washed', quantity: 1, price: 30 },
    { product_id: 'demo-2', product_name: 'Experimental — Fermentation', quantity: 1, price: 30 },
  ],
  total: 60,
  payment_status: 'paid',
  status: 'brewing',
  pickup_time: '10:30',
  notes: '',
  created_at: new Date().toISOString(),
}

export default function TrackPage() {
  const params = useParams()
  const orderId = params.orderid as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      if (orderId.startsWith('demo')) {
        setOrder(demoOrder)
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase.from('orders').select('*').eq('id', orderId).single()
        if (data) setOrder(data)
      } catch {}
      setLoading(false)
    }
    loadOrder()

    // Subscribe to realtime order updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        if (payload.new) setOrder(payload.new as Order)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  if (loading) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <Nav />
        <div style={{ paddingTop: '140px', textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: '1.5rem', color: 'var(--text-muted)', animation: 'counterPulse 1.5s ease infinite' }}>
            Loading...
          </div>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <Nav />
        <div style={{ paddingTop: '140px', textAlign: 'center', padding: '140px 2rem 2rem' }}>
          <h1 className="font-display" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Order not found</h1>
          <Link href="/" style={{ color: 'var(--wine)', textDecoration: 'none' }}>← Back to home</Link>
        </div>
      </main>
    )
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 2rem 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--wine)', marginBottom: '0.75rem' }}>
            Order Status
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 400, letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {order.order_number}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {new Date(order.created_at).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Status progress */}
        {!isCancelled ? (
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '2.5rem',
              marginBottom: '2rem',
            }}
          >
            {/* Current status highlight */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 1.5rem',
                  background: 'rgba(92,26,46,0.06)',
                  borderRadius: '100px',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--wine)',
                    animation: order.status === 'brewing' ? 'counterPulse 1.5s ease infinite' : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--wine)',
                  }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {STATUS_STEPS.find(s => s.key === order.status)?.desc}
              </p>
            </div>

            {/* Steps */}
            <div style={{ position: 'relative' }}>
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentIdx
                const active = i === currentIdx
                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 0',
                      opacity: done ? 1 : 0.35,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: `1.5px solid ${done ? 'var(--wine)' : 'var(--border)'}`,
                        background: done ? 'var(--wine)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.4s ease',
                      }}
                    >
                      {done && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          {i < currentIdx ? (
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <circle cx="6" cy="6" r="3" fill="white" />
                          )}
                        </svg>
                      )}
                    </div>

                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: active ? 500 : 300, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {step.label}
                      </p>
                      {active && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {step.desc}
                        </p>
                      )}
                    </div>

                    {/* Connector line */}
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '15px',
                          top: `${(i + 0.9) * 52}px`,
                          width: '2px',
                          height: '32px',
                          background: i < currentIdx ? 'var(--wine)' : 'var(--border)',
                          transition: 'background 0.4s ease',
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '20px', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
            <p className="font-display" style={{ fontSize: '1.5rem', color: '#991b1b', marginBottom: '0.5rem' }}>Cancelled</p>
            <p style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>This order has been cancelled. Please contact us for assistance.</p>
          </div>
        )}

        {/* Order details */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Order Details
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Name', value: order.customer_name },
              { label: 'Pickup Time', value: order.pickup_time },
              { label: 'Car Number', value: order.car_number },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {order.items.map(item => (
            <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '0.88rem' }}>{item.product_name} × {item.quantity}</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{item.price * item.quantity} AED</span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total</span>
            <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 500 }}>{order.total} AED</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.05em' }}>
            ← Back to FLOW
          </Link>
        </div>
      </div>
    </main>
  )
}
