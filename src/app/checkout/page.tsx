'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { useCart, cartItemsToOrderItems } from '@/lib/cart'
import { ArrowRight, CreditCard, Smartphone } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card')

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    car_number: '',
    pickup_time: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    setError('')

    const orderNumber = `FLOW-${Math.floor(1000 + Math.random() * 9000)}`
    const orderItems = cartItemsToOrderItems(items)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase not configured, go to demo tracking page
    if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey) {
      clearCart()
      router.push(`/track/demo-order-${Date.now()}`)
      return
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          order_number: orderNumber,
          customer_name: form.customer_name,
          phone: form.phone,
          car_number: form.car_number,
          pickup_time: form.pickup_time,
          notes: form.notes,
          items: orderItems,
          total: total,
          payment_status: 'paid',
          status: 'placed',
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error('Insert failed:', errText)
        clearCart()
        router.push(`/track/demo-order-${Date.now()}`)
        return
      }

      const data = await response.json()
      const orderId = Array.isArray(data) ? data[0]?.id : data?.id

      // Update cups sold
      await fetch(`${supabaseUrl}/rest/v1/rpc/increment_cups_sold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ increment_amount: items.reduce((s, i) => s + i.quantity, 0) }),
      })

      clearCart()
      router.push(`/track/${orderId}`)
    } catch (err) {
      console.error('Network error:', err)
      clearCart()
      router.push(`/track/demo-order-${Date.now()}`)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    background: 'white',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    transition: 'border-color 0.2s ease',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
    fontWeight: 400,
  }

  if (items.length === 0) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <Nav />
        <div style={{ paddingTop: '140px', textAlign: 'center', padding: '140px 2rem 2rem' }}>
          <h1 className="font-display" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your cart is empty</h1>
          <a href="/order" style={{ color: 'var(--wine)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to menu</a>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      <div style={{ paddingTop: '100px', maxWidth: '900px', margin: '0 auto', padding: '100px 2rem 80px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)', gap: '3rem', alignItems: 'start' }}>

        {/* Left: Form */}
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--wine)', marginBottom: '0.75rem' }}>
            Reserve
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, marginBottom: '2.5rem' }}>
            Checkout
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Customer details */}
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 400 }}>
                Your Details
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    value={form.customer_name}
                    onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Phone *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+971 5X XXX XXXX"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Car Number *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. A 12345"
                      value={form.car_number}
                      onChange={e => setForm(f => ({ ...f, car_number: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Pickup Time *</label>
                  <input
                    required
                    type="time"
                    value={form.pickup_time}
                    onChange={e => setForm(f => ({ ...f, pickup_time: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any special requests..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 400 }}>
                Payment Method
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { id: 'card' as const, label: 'Card', icon: <CreditCard size={18} /> },
                  { id: 'apple_pay' as const, label: 'Apple Pay', icon: <Smartphone size={18} /> },
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    style={{
                      padding: '1rem',
                      border: `1.5px solid ${paymentMethod === method.id ? 'var(--wine)' : 'var(--border)'}`,
                      borderRadius: '14px',
                      background: paymentMethod === method.id ? 'rgba(92,26,46,0.04)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      color: paymentMethod === method.id ? 'var(--wine)' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {method.icon}
                    {method.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} disabled />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Expiry</label>
                      <input type="text" placeholder="MM / YY" style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} disabled />
                    </div>
                    <div>
                      <label style={labelStyle}>CVC</label>
                      <input type="text" placeholder="•••" style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} disabled />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    🔒 Stripe integration — connect your Stripe keys to enable payments
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.1rem',
                background: loading ? 'var(--border)' : 'var(--wine)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: 400,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Processing...' : `Place Order · ${total} AED`}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        {/* Right: Order summary */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '2rem',
            position: 'sticky',
            top: '100px',
          }}
        >
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Order Summary
          </p>

          {items.map(item => (
            <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '0.88rem' }}>{item.product.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>× {item.quantity}</p>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 400 }}>{item.product.price * item.quantity} AED</p>
            </div>
          ))}

          <div style={{ paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total</span>
            <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 500 }}>{total} AED</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 700px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}
