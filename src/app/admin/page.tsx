'use client'

import { useEffect, useState } from 'react'
import { supabase, Order, Product, Settings, OrderStatus } from '@/lib/supabase'
import Nav from '@/components/Nav'
import { Plus, Edit2, Trash2, Check, X, RefreshCw } from 'lucide-react'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'flow2024'

const STATUS_OPTIONS: OrderStatus[] = ['placed', 'confirmed', 'brewing', 'ready', 'delivered', 'cancelled']

const demoOrders: Order[] = [
  {
    id: 'demo-1',
    order_number: 'FLOW-1042',
    customer_name: 'Ahmad Al Mansouri',
    phone: '+971 50 123 4567',
    car_number: 'A 12345',
    items: [{ product_id: 'p1', product_name: 'Costa Rica — Washed', quantity: 2, price: 30 }],
    total: 60,
    payment_status: 'paid',
    status: 'brewing',
    pickup_time: '10:30',
    notes: 'No sugar please',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    order_number: 'FLOW-1043',
    customer_name: 'Sara',
    phone: '+971 55 987 6543',
    car_number: 'B 99999',
    items: [{ product_id: 'p2', product_name: 'Experimental — Fermentation', quantity: 1, price: 30 }],
    total: 30,
    payment_status: 'paid',
    status: 'confirmed',
    pickup_time: '11:00',
    notes: '',
    created_at: new Date().toISOString(),
  },
]

const demoProducts: Product[] = [
  { id: 'demo-p1', name: 'Costa Rica — Washed', origin: 'Costa Rica', process: 'Washed', notes: ['White Peach', 'Jasmine', 'Honey'], price: 30, available_today: true, created_at: new Date().toISOString() },
  { id: 'demo-p2', name: 'Experimental — Fermentation', origin: 'Ethiopia', process: 'Anaerobic', notes: ['Cherry', 'Tropical', 'Silky'], price: 30, available_today: true, created_at: new Date().toISOString() },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [orders, setOrders] = useState<Order[]>(demoOrders)
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [settings, setSettings] = useState<Settings>({ id: '1', daily_limit: 40, cups_sold: 12, updated_at: new Date().toISOString() })
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'settings'>('overview')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newLimit, setNewLimit] = useState('')
  const [saving, setSaving] = useState(false)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      loadData()
    } else {
      setPasswordError(true)
    }
  }

  const loadData = async () => {
    try {
      const [{ data: ords }, { data: prods }, { data: sett }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at'),
        supabase.from('settings').select('*').single(),
      ])
      if (ords && ords.length > 0) setOrders(ords)
      if (prods && prods.length > 0) setProducts(prods)
      if (sett) setSettings(sett)
    } catch {}
  }

  useEffect(() => {
    if (!authed) return
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [authed])

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId)
    } catch {}
  }

  const toggleProductAvailability = async (productId: string, available: boolean) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, available_today: available } : p))
    try {
      await supabase.from('products').update({ available_today: available }).eq('id', productId)
    } catch {}
  }

  const updateDailyLimit = async () => {
    const limit = parseInt(newLimit)
    if (isNaN(limit) || limit < 1) return
    setSaving(true)
    setSettings(prev => ({ ...prev, daily_limit: limit }))
    try {
      await supabase.from('settings').update({ daily_limit: limit }).eq('id', settings.id)
    } catch {}
    setSaving(false)
    setNewLimit('')
  }

  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
  const revenue = todayOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0)

  const inputStyle = {
    padding: '0.6rem 0.875rem',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    background: 'white',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
  }

  if (!authed) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '360px', padding: '2rem', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="font-display" style={{ fontSize: '1.75rem', color: 'var(--wine)', letterSpacing: '0.1em' }}>FLOW</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>Admin</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                ...inputStyle,
                width: '100%',
                borderColor: passwordError ? '#dc2626' : 'var(--border)',
              }}
            />
            {passwordError && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.4rem' }}>Incorrect password</p>}
          </div>

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--wine)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Enter
          </button>
        </div>
      </main>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: `Orders (${todayOrders.length})` },
    { id: 'products', label: 'Coffees' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 2rem 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--wine)', marginBottom: '0.4rem' }}>
              Admin Dashboard
            </p>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300 }}>
              FLOW Control
            </h1>
          </div>
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.35rem', marginBottom: '2rem', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--wine)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: activeTab === tab.id ? 400 : 300,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Orders Today', value: todayOrders.length.toString(), unit: '' },
                { label: 'Cups Sold', value: settings.cups_sold.toString(), unit: `/ ${settings.daily_limit}` },
                { label: 'Cups Remaining', value: Math.max(0, settings.daily_limit - settings.cups_sold).toString(), unit: '' },
                { label: 'Revenue Today', value: revenue.toString(), unit: 'AED' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.75rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {stat.label}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span className="font-display" style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--wine)', lineHeight: 1 }}>
                      {stat.value}
                    </span>
                    {stat.unit && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stat.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent orders preview */}
            <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Recent Orders
            </h2>
            <OrderTable orders={todayOrders.slice(0, 5)} onStatusChange={updateOrderStatus} />
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              All Orders Today
            </h2>
            <OrderTable orders={todayOrders} onStatusChange={updateOrderStatus} />
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {products.map(product => (
                <div key={product.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--wine)', marginBottom: '0.25rem' }}>
                      {product.process} · {product.origin}
                    </p>
                    <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.4rem' }}>{product.name}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {product.notes.map(n => (
                        <span key={n} style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem', background: 'var(--parchment)', borderRadius: '100px', color: 'var(--text-secondary)' }}>{n}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 500 }}>{product.price} AED</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={product.available_today}
                        onChange={e => toggleProductAvailability(product.id, e.target.checked)}
                        style={{ accentColor: 'var(--wine)', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Available today</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '480px' }}>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Daily Cup Limit
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current limit</p>
                  <p className="font-display" style={{ fontSize: '2.5rem', color: 'var(--wine)', fontWeight: 500, lineHeight: 1 }}>{settings.daily_limit}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Cups sold</p>
                  <p className="font-display" style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 300, lineHeight: 1 }}>{settings.cups_sold}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="number"
                  placeholder="New limit (e.g. 50)"
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  min={1}
                />
                <button
                  onClick={updateDailyLimit}
                  disabled={saving || !newLimit}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: 'var(--wine)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    opacity: saving || !newLimit ? 0.5 : 1,
                  }}
                >
                  {saving ? '...' : 'Update'}
                </button>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
              <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Reset Cups Sold (Daily)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Reset the cups sold counter at the start of each day.
              </p>
              <button
                onClick={async () => {
                  setSettings(prev => ({ ...prev, cups_sold: 0 }))
                  try { await supabase.from('settings').update({ cups_sold: 0 }).eq('id', settings.id) } catch {}
                }}
                style={{
                  padding: '0.7rem 1.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Reset Counter
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function OrderTable({ orders, onStatusChange }: { orders: Order[]; onStatusChange: (id: string, status: OrderStatus) => void }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '18px', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders yet today</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {orders.map(order => (
        <div key={order.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--wine)', textTransform: 'uppercase' }}>{order.order_number}</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 400, marginTop: '0.15rem' }}>{order.customer_name}</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                className={`status-${order.status}`}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '100px',
                  fontWeight: 400,
                  textTransform: 'capitalize',
                  letterSpacing: '0.05em',
                }}
              >
                {order.status}
              </span>
              <select
                value={order.status}
                onChange={e => onStatusChange(order.id, e.target.value as OrderStatus)}
                style={{
                  padding: '0.4rem 0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'white',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {[
              { label: 'Phone', value: order.phone },
              { label: 'Car', value: order.car_number },
              { label: 'Pickup', value: order.pickup_time },
              { label: 'Total', value: `${order.total} AED` },
            ].map(row => (
              <div key={row.label}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{row.label}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>{row.value}</p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            {order.items.map(item => (
              <span key={item.product_id} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '1rem' }}>
                {item.product_name} × {item.quantity}
              </span>
            ))}
            {order.notes && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                &quot;{order.notes}&quot;
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
