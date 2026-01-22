import React from 'react'

export default function CartPage({ cart, onUpdateQuantity, onRemove, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 0 ? 50 : 0
  const total = subtotal + shipping

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>Add some products to get started!</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          {cart.map(item => (
            <div key={item.itemId} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px',
              display: 'flex',
              gap: '20px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {item.images?.[0]?.imageUrl ? (
                  <img src={item.images[0].imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '48px' }}>📦</span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{item.itemName}</h3>
                {item.brand && <p style={{ color: '#6b7280', marginBottom: '8px' }}>{item.brand}</p>}
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>₹{item.price}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <button
                  onClick={() => onRemove(item.itemId)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Remove
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#e5e7eb',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#e5e7eb',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            position: 'sticky',
            top: '100px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Order Summary</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Subtotal ({cart.length} items)</span>
                <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: '600' }}>₹{shipping.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700' }}>
                <span>Total</span>
                <span style={{ color: '#3b82f6' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
