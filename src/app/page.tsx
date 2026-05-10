'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { supabase, Product, Settings } from '@/lib/supabase'
import { useCart } from '@/lib/cart'
import { Plus, Minus, ArrowRight } from 'lucide-react'

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

const defaultSettings: Settings = {
  id: '1',
  daily_limit: 40,
  cups_sold: 12,
  updated_at: new Date().toISOString(),
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const { addItem, totalItems } = useCart()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('available_today', true)
          .order('created_at')

        if (prods && prods.length > 0) setProducts(prods)

        const { data: sett } = await supabase
          .from('settings')
          .select('*')
          .single()

        if (sett) setSettings(sett)
      } catch {}
    }
    loadData()

    // Subscribe to realtime settings changes
    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new) setSettings(payload.new as Settings)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const soldOut = settings.cups_sold >= settings.daily_limit
  const remaining = Math.max(0, settings.daily_limit - settings.cups_sold)
  const pct = Math.min(100, (settings.cups_sold / settings.daily_limit) * 100)

  const handleAdd = (product: Product) => {
    const qty = quantities[product.id] || 1
    for (let i = 0; i < qty; i++) addItem(product)
    setAddedIds(prev => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 1500)
  }

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <section
        style={{
          paddingTop: '120px',
          paddingBottom: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '140px 2rem 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background orb */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(92,26,46,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <p
          className="stagger-1 animate-fade-up"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--wine)',
            marginBottom: '1.5rem',
            fontWeight: 400,
          }}
        >
          Modern Slow Bar · فلو
        </p>

        <h1
          className="font-display stagger-2 animate-fade-up"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: 300,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '2rem',
          }}
        >
          FLOW
        </h1>

        <p
          className="stagger-3 animate-fade-up"
          style={{
            fontSize: '1rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            maxWidth: '360px',
            lineHeight: 1.7,
            marginBottom: '3rem',
            letterSpacing: '0.01em',
          }}
        >
          Precision-brewed juicy coffee<br />served at peak flow.
        </p>

        {soldOut ? (
          <div
            className="stagger-4 animate-fade-up"
            style={{
              padding: '1rem 2.5rem',
              background: '#F9F5F0',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.05em',
            }}
          >
            SOLD OUT — Tomorrow&apos;s Flow Opens Soon
          </div>
        ) : (
          <Link
            href="/order"
            className="stagger-4 animate-fade-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2.5rem',
              background: 'var(--wine)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '100px',
              fontSize: '0.8rem',
              fontWeight: 400,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--wine-light)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--wine)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            Reserve Your Cup
            <ArrowRight size={14} />
          </Link>
        )}
      </section>

      {/* Daily Cup Counter */}
      <section
        style={{
          padding: '0 2rem 80px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
            }}
          >
            Today&apos;s Availability
          </p>

          {soldOut ? (
            <div>
              <p
                className="font-display"
                style={{
                  fontSize: '3rem',
                  fontWeight: 400,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                Sold Out
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                All {settings.daily_limit} cups claimed today
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                <span
                  className="font-display"
                  style={{
                    fontSize: '4rem',
                    fontWeight: 500,
                    color: 'var(--wine)',
                    lineHeight: 1,
                  }}
                >
                  {remaining}
                </span>
                <span
                  className="font-display"
                  style={{
                    fontSize: '2rem',
                    fontWeight: 300,
                    color: 'var(--text-muted)',
                  }}
                >
                  / {settings.daily_limit}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                cups available today
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div
            style={{
              height: '3px',
              background: 'var(--border)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: soldOut ? '#9E9890' : 'var(--wine)',
                borderRadius: '2px',
                transition: 'width 0.8s ease',
              }}
            />
          </div>

          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              marginTop: '0.75rem',
              letterSpacing: '0.05em',
            }}
          >
            {settings.cups_sold} reserved today
          </p>
        </div>
      </section>

      {/* Featured Coffees */}
      {!soldOut && (
        <section style={{ padding: '0 2rem 100px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <p
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginBottom: '3rem',
              }}
            >
              Today&apos;s Selection
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {products.map((product, i) => (
                <div
                  key={product.id}
                  style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '2rem',
                    transition: 'all 0.4s ease',
                    animation: `fadeUp 0.6s ease ${0.1 + i * 0.15}s both`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.06)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                >
                  {/* Header */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p
                          style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--wine)',
                            marginBottom: '0.4rem',
                          }}
                        >
                          {product.process}
                        </p>
                        <h3
                          className="font-display"
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: 400,
                            color: 'var(--text-primary)',
                            lineHeight: 1.2,
                          }}
                        >
                          {product.name}
                        </h3>
                      </div>
                      <span
                        className="font-display"
                        style={{
                          fontSize: '1.3rem',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {product.price} AED
                      </span>
                    </div>
                  </div>

                  {/* Tasting notes */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {product.notes.map(note => (
                      <span
                        key={note}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.3rem 0.75rem',
                          background: 'var(--parchment)',
                          borderRadius: '100px',
                          color: 'var(--text-secondary)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {note}
                      </span>
                    ))}
                  </div>

                  {/* Quantity + Add */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '100px',
                        padding: '0.5rem 1rem',
                      }}
                    >
                      <button
                        onClick={() => setQuantities(q => ({
                          ...q,
                          [product.id]: Math.max(1, (q[product.id] || 1) - 1)
                        }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '0.9rem', minWidth: '1rem', textAlign: 'center' }}>
                        {quantities[product.id] || 1}
                      </span>
                      <button
                        onClick={() => setQuantities(q => ({
                          ...q,
                          [product.id]: (q[product.id] || 1) + 1
                        }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAdd(product)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: addedIds.has(product.id) ? '#065f46' : 'var(--wine)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '100px',
                        fontSize: '0.78rem',
                        fontWeight: 400,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {addedIds.has(product.id) ? '✓ Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalItems > 0 && (
              <div
                style={{
                  marginTop: '2.5rem',
                  textAlign: 'center',
                  animation: 'fadeUp 0.4s ease both',
                }}
              >
                <Link
                  href="/checkout"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 3rem',
                    background: 'var(--text-primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  Checkout ({totalItems} {totalItems === 1 ? 'cup' : 'cups'})
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Experience section */}
      <section
        style={{
          background: 'var(--parchment)',
          padding: '80px 2rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--wine)',
              marginBottom: '2rem',
            }}
          >
            The Experience
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 300,
              color: 'var(--text-primary)',
              marginBottom: '2.5rem',
              lineHeight: 1.2,
            }}
          >
            Brewed precisely,<br />served at the moment it peaks.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2rem',
              textAlign: 'left',
            }}
          >
            {[
              { num: '01', title: 'Reserve', desc: 'Claim your daily cup from a limited run of 40.' },
              { num: '02', title: 'Arrive', desc: 'Pull up and let us know you\'re near.' },
              { num: '03', title: 'Brew', desc: 'We start your pour-over at precisely the right moment.' },
              { num: '04', title: 'Peak', desc: 'Served at ideal dilution, temperature, and flavour.' },
            ].map(step => (
              <div key={step.num}>
                <p
                  className="font-display"
                  style={{
                    fontSize: '2rem',
                    color: 'var(--border)',
                    fontWeight: 400,
                    lineHeight: 1,
                    marginBottom: '0.75rem',
                  }}
                >
                  {step.num}
                </p>
                <p
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {step.title}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '3rem 2rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span
          className="font-display"
          style={{
            fontSize: '1.1rem',
            color: 'var(--wine)',
            letterSpacing: '0.1em',
          }}
        >
          FLOW
        </span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Modern Slow Bar · فلو
        </p>
        <Link
          href="/admin"
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
          }}
        >
          Admin
        </Link>
      </footer>
    </main>
  )
}
