'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { supabase, Product, Settings } from '@/lib/supabase'
import { useCart } from '@/lib/cart'
import { Plus, Minus, ShoppingBag, ArrowRight, X } from 'lucide-react'

const defaultProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Costa Rica — Washed',
    origin: 'Costa Rica',
    process: 'Washed',
    notes: ['White Peach', 'Jasmine', 'Honey'],
    price: 30,
    available_today: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Experimental — Fermentation',
    origin: 'Ethiopia',
    process: 'Anaerobic',
    notes: ['Cherry', 'Tropical', 'Silky'],
    price: 30,
    available_today: true,
    created_at: new Date().toISOString(),
  },
]

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [settings, setSettings] = useState<Settings>({
    id: '1',
    daily_limit: 40,
    cups_sold: 12,
    updated_at: new Date().toISOString(),
  })
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [showCart, setShowCart] = useState(false)
  const { items, addItem, updateQuantity, removeItem, total, totalItems } = useCart()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('available_today', true)

        if (prods && prods.length > 0) setProducts(prods)

        const { data: sett } = await supabase.from('settings').select('*').single()
        if (sett) setSettings(sett)
      } catch {}
    }
    loadData()
  }, [])

  const soldOut = settings.cups_sold >= settings.daily_limit

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      <div style={{ paddingTop: '100px', padding: '100px 2rem 80px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--wine)', marginBottom: '0.75rem' }}>
            Today&apos;s Menu
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1 }}>
            Order
          </h1>
          {!soldOut && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              {settings.daily_limit - settings.cups_sold} cups remaining today
            </p>
          )}
        </div>

        {soldOut ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <p className="font-display" style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Sold Out
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All cups for today have been reserved.<br />Come back tomorrow.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {products.map(product => (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.07)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--wine)', marginBottom: '0.3rem' }}>
                    {product.process} · {product.origin}
                  </p>
                  <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0.75rem' }}>
                    {product.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {product.notes.map(n => (
                      <span key={n} style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', background: 'var(--parchment)', borderRadius: '100px', color: 'var(--text-secondary)' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                  <p className="font-display" style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {product.price} AED
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.5rem 1rem' }}>
                    <button
                      onClick={() => setQuantities(q => ({ ...q, [product.id]: Math.max(1, (q[product.id] || 1) - 1) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '0.9rem', minWidth: '1rem', textAlign: 'center' }}>
                      {quantities[product.id] || 1}
                    </span>
                    <button
                      onClick={() => setQuantities(q => ({ ...q, [product.id]: (q[product.id] || 1) + 1 }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const qty = quantities[product.id] || 1
                      for (let i = 0; i < qty; i++) addItem(product)
                      setShowCart(true)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'var(--wine)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '100px',
                      fontSize: '0.78rem',
                      fontWeight: 400,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--wine-light)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--wine)'}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            animation: 'fadeUp 0.4s ease both',
          }}
        >
          <button
            onClick={() => setShowCart(s => !s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              background: 'var(--text-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '100px',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <ShoppingBag size={16} />
            {totalItems} cup{totalItems > 1 ? 's' : ''} · {total} AED
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={() => setShowCart(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              background: 'var(--cream)',
              height: '100%',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 400 }}>Your Order</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              {items.map(item => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 400 }}>{item.product.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.product.price} AED each</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.3rem 0.75rem' }}>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.85rem', minWidth: '1rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total</span>
                <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 500 }}>{total} AED</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setShowCart(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--wine)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '14px',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 400,
                }}
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </main>
  )
}
