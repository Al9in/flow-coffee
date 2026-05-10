'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { ShoppingBag } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const { totalItems } = useCart()
  const pathname = usePathname()

  const isAdmin = pathname.startsWith('/admin')

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(250, 250, 248, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(232, 228, 220, 0.6)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span
          className="font-display"
          style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'var(--wine)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          FLOW
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {!isAdmin && (
          <>
            <Link
              href="/order"
              style={{
                fontSize: '0.8rem',
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              Order
            </Link>

            <Link
              href="/order"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: totalItems > 0 ? 'var(--wine)' : 'transparent',
                border: '1px solid',
                borderColor: totalItems > 0 ? 'var(--wine)' : 'var(--border)',
                color: totalItems > 0 ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
              }}
            >
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#1A1510',
                    color: 'white',
                    fontSize: '0.65rem',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </>
        )}

        {isAdmin && (
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Admin
          </span>
        )}
      </div>
    </nav>
  )
}
